import Base from './base';

class BrowserHistory extends Base {
  constructor(router) {
    super(router);
  }
  setupListener() {
    window.addEventListener('popstate', function () {
      console.log(window.location.pathname);
    });
  }
  getCurrentLocation() {
    return window.location.pathname;
  }
}

export default BrowserHistory;
