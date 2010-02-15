var WikiNotepadWizard = {

  init: function() {
    this.WikiNotepad = window.arguments[0];

    // Init fields
    this.rootDir = document.getElementById("rootDir");
    this.wikiName = document.getElementById("wikiName");
    this.wizard = document.getElementById("wikiNotepadWizard");
    
    // Init wizard elements
    document.getElementById("wikiNotepadWizard").canAdvance = false;
  },

  createWiki: function() {
    alert("Create wiki");
  },

  selectRoot: function() {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fpicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    
    // Default values, assumes export
    var mode = fpicker.modeGetFolder;
    var fpHeadStr = "Select WikiNotepad Root Directory";
    
    fpicker.init(window, fpHeadStr, mode);
    
    var showResult = fpicker.show();
    if (showResult == fpicker.returnOK || showResult == fpicker.returnReplace) {
      this.theFile = fpicker.file;
      this.rootDir.value = fpicker.file.path;
      this.step1CanAdvance();
    }
  },

    step1CanAdvance: function() {
        if (this.rootDir.value && this.wikiName.value) {
	    this.wizard.canAdvance = true;
        } else {
	    this.wizard.canAdvance = false;
        }
    },

  step2Show: function() {
    document.getElementById("summaryWikiName").value = this.wikiName.value;
    document.getElementById("summaryRootDir").value = this.rootDir.value;
  },

  step3Show: function() {
    // Create Subfolders: pages, images
    var images = this.theFile.clone();
    images.append("images");

    var homepage = this.theFile.clone();
    homepage.append("Main.wnp");

    if (images.exists() && homepage.exists()) {
      // Give the user a choice:
      // - Add a reference to the wiki root
      // - Go back and select another root directory
      document.getElementById("wikiCreateImageProgress").firstChild.nodeValue = "There is already a wiki installed at this location. Either click Back to select a new location or click Next to add the existing wiki.";
      
      this.restart = true;
    } else {
      if (!images.exists()) {
        images.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
	document.getElementById("wikiCreateImageProgress").value = "Created images directory";
      }
      // Create home page
      if (!homepage.exists()) {
        homepage.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0644);
	document.getElementById("wikiCreateHomepageProgress").value = "Created home page";

	// Add default content
        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
	foStream.init(homepage, 0x02, 0644, 0);

        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, "UTF-8", 0, 0);

	var data = document.getElementById("defaultContent").firstChild.nodeValue;
        converter.writeString(data);
        converter.close(); // this closes foStream
	
      }

      // Add the wiki information to the configuration
      this.WikiNotepad.addWiki(this.wikiName.value, this.rootDir.value);

      document.getElementById("wikiCreateComplete").value = "Wiki creation complete";
      this.restart = false;
    }
  },
     
    step3Rewind: function () {
	if (this.restart) {
	    this.wizard.goTo("step1");
	    return false;
        }
	return true;
    },

    finish: function () {
	return true;
    }
};
