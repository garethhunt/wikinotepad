var WikiNotepadManage = {

  init: function() {
    this.WikiNotepad = window.arguments[0];

    if (this.WikiNotepad.wikis.length == 0) {
      document.getElementById("edit-wiki").setAttribute("disabled", "true");
      document.getElementById("delete-wiki").setAttribute("disabled", "true");
    }

    // Enable treeView to see the array of wikis
    this.treeView.srcData = this.WikiNotepad.wikis;
    document.getElementById("wikiTree").view = this.treeView;
  },
  
  // Add wiki to the configuration
  addWiki: function() {
    // Make a copy of the wikis array for later comparison
    var tempWikis = this.WikiNotepad.wikis.slice(0);

    window.openDialog("chrome://wikinotepad/content/wizard.xul", "wikiNotepadWizard", "resizable,dialog,centerscreen,modal", this.WikiNotepad);

    // Check the wiki parameters are populated
    if (this.WikiNotepad.wikis.length > tempWikis.length) {
      this.treeView.treeBox.rowCountChanged(this.WikiNotepad.length-1, 1);
      this.treeView.selection.select(this.WikiNotepad.length-1);
    }
    if (this.WikiNotepad.wikis.length > 0) {
      if (document.getElementById("edit-wiki").hasAttribute("disabled")) {
        document.getElementById("edit-wiki").removeAttribute("disabled");
      }
      if (document.getElementById("delete-wiki").hasAttribute("disabled")) {
        document.getElementById("delete-wiki").removeAttribute("disabled");
      }
    }
  },
	   
  // Edit a wikis configuration
  editWiki: function() {
    if (this.treeView.selection.currentIndex == -1) {
      alert("Please select a Wiki to edit");
      return;
    }
    var wiki = this.WikiNotepad.wikis[this.treeView.selection.currentIndex];
    var wikiDialog = window.openDialog("chrome://wikinotepad/content/wikidialog.xul", "wikiDialog", "resizable,dialog,centerscreen,modal", wiki);

    // Check the wiki parameters are populated
    if (wiki.name != null && wiki.root != null) {
      // Call this so the tree updates immediately
      this.treeView.refresh(this.treeView.selection.currentIndex);
    }
  },
  
  // Remove wiki from the configuration
  deleteWiki: function() {
    if (this.treeView.selection.currentIndex == -1) {
      alert("Please select a Wiki to edit");
      return;
    }

    if (confirm("Confirm deletion of wiki: " + this.WikiNotepad.wikis[this.treeView.selection.currentIndex].name)) {
      this.WikiNotepad.wikis.splice(this.treeView.selection.currentIndex, 1);
      this.treeView.treeBox.rowCountChanged(this.treeView.selection.currentIndex, -1);
      this.treeView.selection.select(this.WikiNotepad.wikis.length-1);
    }
  },

  // For the Manage Wikis dialog
  treeView: {
    srcData: null,
    selection: null,
    get rowCount() { return (this.srcData) ? this.srcData.length : 0 },
    getCellText : function(row,column) {
      if (column.id == "name") {
        return this.srcData[row].name;
      } else if (column.id == "root") {
        return this.srcData[row].root;
      }
    },
    setTree: function(treebox) { this.treeBox = treebox; },
    isContainer: function(row) { return false; },
    isSeparator: function(row) { return false; },
    isSorted: function() { return false; },
    getLevel: function(row) { return 0; },
    getImageSrc: function(row,col) { return null; },
    getRowProperties: function(row,props) {},
    getCellProperties: function(row,col,props) {},
    getColumnProperties: function(colid,col,props) {},
    refresh: function(index) {
      this.treeBox.invalidateRow(index);
      //this.selection.select(index);
    }
  }
}
