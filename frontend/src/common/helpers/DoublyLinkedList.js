class DoublyLinkedListNode {
  constructor(name) {
    this.name = name;
    this.prev = null;
    this.next = null;
  }

  getNextNode() {
    if (this.next) {
      return this.next;
    }
    return null;
  }

  getPrevNode() {
    if (this.prev) {
      return this.prev;
    }
    return null;
  }
}

export class DoublyLinkedList {
  constructor(nodeNames = []) {
    this.nodes = [];
    for (var i = 0; i < nodeNames.length; i++) {
      this.nodes[i] = new DoublyLinkedListNode(nodeNames[i]);
      if (i-1 >= 0) {
        this.nodes[i-1].next = this.nodes[i];
        this.nodes[i].prev = this.nodes[i-1];
      }
    }
  }

  getNode(nodeName) {
    const node = this.nodes.find(element => element.name === nodeName);
    return node;
  }
}


