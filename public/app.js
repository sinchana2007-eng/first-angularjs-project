(function () {
  'use strict';

  angular.module('libraryApp', [])
    .controller('LibraryController', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
      var vm = this;
      vm.view = 'overview';
      vm.search = '';
      vm.loanFilter = 'active';
      vm.loading = true;
      vm.saving = false;
      vm.books = [];
      vm.members = [];
      vm.loans = [];
      vm.recentLoans = [];
      vm.stats = {};

      vm.setView = function (view) {
        vm.view = view;
        vm.search = '';
        vm.error = '';
        vm.success = '';
        if (view === 'books') return loadBooks();
        if (view === 'members') return loadMembers();
        if (view === 'loans') return loadLoans();
        return loadDashboard();
      };

      vm.viewLabel = function () {
        return { overview: 'OVERVIEW', books: 'COLLECTION', members: 'COMMUNITY', loans: 'CIRCULATION' }[vm.view];
      };

      vm.pageTitle = function () {
        return { overview: 'Good day, librarian', books: 'Your collection', members: 'Library members', loans: 'Book circulation' }[vm.view];
      };

      vm.formatDate = function (value) {
        if (!value) return '—';
        var date = new Date(value + (value.length === 10 ? 'T00:00:00' : ''));
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      };

      vm.initials = function (name) {
        return (name || '?').split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
      };

      vm.loanStatus = function (loan) {
        if (loan.returned_at) return 'Returned';
        return loan.due_date < new Date().toISOString().slice(0, 10) ? 'Overdue' : 'On loan';
      };

      vm.loanStatusClass = function (loan) {
        return { 'badge-green': loan.returned_at, 'badge-red': !loan.returned_at && vm.loanStatus(loan) === 'Overdue', 'badge-blue': !loan.returned_at && vm.loanStatus(loan) !== 'Overdue' };
      };

      vm.filteredBooks = function () {
        var query = (vm.search || '').toLowerCase();
        return vm.books.filter(function (book) {
          return [book.title, book.author, book.isbn, book.category].some(function (value) { return (value || '').toLowerCase().indexOf(query) !== -1; });
        });
      };

      vm.filteredMembers = function () {
        var query = (vm.search || '').toLowerCase();
        return vm.members.filter(function (member) {
          return [member.name, member.email, member.phone].some(function (value) { return (value || '').toLowerCase().indexOf(query) !== -1; });
        });
      };

      vm.filteredLoans = function () {
        var query = (vm.search || '').toLowerCase();
        return vm.loans.filter(function (loan) {
          var status = vm.loanStatus(loan).toLowerCase();
          var matchesFilter = vm.loanFilter === 'all'
            || (vm.loanFilter === 'active' && !loan.returned_at)
            || (vm.loanFilter === 'returned' && !!loan.returned_at)
            || (vm.loanFilter === 'overdue' && status === 'overdue');
          var matchesSearch = [loan.book && loan.book.title, loan.member && loan.member.name, loan.member && loan.member.email]
            .some(function (value) { return (value || '').toLowerCase().indexOf(query) !== -1; });
          return matchesFilter && matchesSearch;
        });
      };

      vm.availableBooks = function () {
        return vm.books.filter(function (book) { return book.available_copies > 0; });
      };

      vm.openCreate = function () {
        vm.form = { total_copies: 1 };
        vm.modal = vm.view === 'books' ? 'book' : 'member';
      };

      vm.openEditBook = function (book) {
        vm.form = angular.copy(book);
        vm.modal = 'book';
      };

      vm.openEditMember = function (member) {
        vm.form = angular.copy(member);
        vm.modal = 'member';
      };

      vm.openLoan = function () {
        vm.form = { due_date: new Date(Date.now() + 14 * 86400000) };
        loadBooks();
        loadMembers();
        vm.modal = 'loan';
      };

      vm.closeModal = function (event) {
        if (event.target === event.currentTarget) vm.modal = null;
      };

      vm.saveBook = function () {
        return save('book', '/api/books', function () { return loadBooks(); });
      };

      vm.saveMember = function () {
        return save('member', '/api/members', function () { return loadMembers(); });
      };

      function save(kind, endpoint, reload) {
        vm.saving = true;
        vm.error = '';
        var payload = angular.copy(vm.form);
        var request = payload.id ? $http.put(endpoint + '/' + payload.id, payload) : $http.post(endpoint, payload);
        return request.then(function () {
          vm.modal = null;
          vm.success = kind === 'book' ? 'Book saved to your collection.' : 'Member details saved.';
          return reload();
        }).catch(showError).finally(function () { vm.saving = false; });
      }

      vm.deleteBook = function (book) {
        if (!window.confirm('Delete "' + book.title + '"? Books with loan history cannot be deleted.')) return;
        $http.delete('/api/books/' + book.id).then(function () {
          vm.success = 'Book deleted.';
          return loadBooks();
        }).catch(showError);
      };

      vm.deleteMember = function (member) {
        if (!window.confirm('Delete ' + member.name + '? Members with loan history cannot be deleted.')) return;
        $http.delete('/api/members/' + member.id).then(function () {
          vm.success = 'Member deleted.';
          return loadMembers();
        }).catch(showError);
      };

      vm.createLoan = function () {
        vm.saving = true;
        vm.error = '';
        var payload = angular.copy(vm.form);
        var dueDate = payload.due_date;
        payload.due_date = dueDate.getFullYear() + '-'
          + String(dueDate.getMonth() + 1).padStart(2, '0') + '-'
          + String(dueDate.getDate()).padStart(2, '0');
        $http.post('/api/loans', payload).then(function () {
          vm.modal = null;
          vm.success = 'Book checked out successfully.';
          return $q.all([loadBooks(), loadLoans(), loadDashboard()]);
        }).catch(showError).finally(function () { vm.saving = false; });
      };

      vm.returnLoan = function (loan) {
        $http.post('/api/loans/' + loan.id + '/return').then(function () {
          vm.success = 'Book marked as returned.';
          return $q.all([loadBooks(), loadLoans(), loadDashboard()]);
        }).catch(showError);
      };

      function showError(response) {
        vm.error = response.data && response.data.error ? response.data.error : 'Something went wrong. Please try again.';
      }

      function loadBooks() {
        return $http.get('/api/books').then(function (response) { vm.books = response.data; }).catch(showError);
      }

      function loadMembers() {
        return $http.get('/api/members').then(function (response) { vm.members = response.data; }).catch(showError);
      }

      function loadLoans() {
        return $http.get('/api/loans').then(function (response) { vm.loans = response.data; }).catch(showError);
      }

      function loadDashboard() {
        vm.loading = true;
        return $http.get('/api/dashboard').then(function (response) {
          vm.stats = response.data.stats;
          vm.recentLoans = response.data.recentLoans;
        }).catch(showError).finally(function () { vm.loading = false; });
      }

      $timeout(function () {
        loadDashboard().then(function () {
          return Promise.all([loadBooks(), loadMembers(), loadLoans()]);
        }).catch(showError);
      });
    }]);
}());
