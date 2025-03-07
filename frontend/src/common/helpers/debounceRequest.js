// holds the search requests for 300ms before fetching the most recent one
// expects a callback fn in debounceRequest that is triggered 
// call clearDebounce to remove timers before unmounting a component
class Debounce {
  // instantiate the class with the debounce delay in ms
  constructor (delay=300) {
    this.delay = delay;
    this.queries = [];
    this.timers = [];
  }
  debounceRequest (callback) {
    this.queries.push(callback);
    const timerId = setTimeout(() => {
      this.clearDebounce();
      this.queries[this.queries.length - 1]();
      this.queries = [];
    }, this.delay);
    this.timers.push(timerId);
  }
  clearDebounce () {
    this.timers.forEach(t => clearTimeout(t));
  }
}

export default Debounce;
