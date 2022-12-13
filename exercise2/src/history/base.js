class Base {
  constructor(router) {
    this.router = router;
  }
  transitionTo(location, listener) {
    const record = this.router.match(location);
    console.log(record);
    listener && listener();
  }
}

export default Base;
