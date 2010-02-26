/*global dump: false, Components: false, document:false, window:false */

var WikiNotepad = {

    wikinotepad: <wikinotepad>
                <wikis>
		</wikis>
            </wikinotepad>,

    wikis: [],

    activeWiki: null,

    init: function (event) {
        // Register 'wnp' file mime type with category manager
        var catMgr = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
        catMgr.addCategoryEntry("ext-to-type-mapping", "wnp", "application/x-wikinotepad", true, true);

        // Load the configuration file and initialize the configuration
        this.loadConfig();

	// Determine which wiki is active and load it into the browser
	if (this.selectedWiki && this.selectedWiki.root && this.selectedWiki.root.length > 0) {
            this.openWiki(this.selectedWiki);
	}
    },

    loadConfig: function () {
	var config = null;
	//this.initConfigFile();

        // Get the configuration file 
        try {
            this.file = Components.classes["@mozilla.org/file/directory_service;1"].
                     getService(Components.interfaces.nsIProperties).
                     get("ProfD", Components.interfaces.nsIFile);


            this.file.append("wikinotepad-config.xml");
        } catch (e) {
            Components.utils.reportError(e);
        }

        //
        // If config file does not exist, create it and initialize
        if (this.file.exists()) {
            try {
		var data = new String();
		var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
		var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
		    createInstance(Components.interfaces.nsIScriptableInputStream);
		fiStream.init(this.file, 1, 0, false);
		siStream.init(fiStream);
		data += siStream.read(-1);
		siStream.close();
		fiStream.close();
                config = new XML(data);
            } catch(e) {
		Components.utils.reportError(e);
            }
	    
        } else {
	    // Create the file and write the basic configuration
	    this.saveConfig();
	    config = this.wikinotepad;
        }

        // Process the configuration XML
	//var wikiList = config.wikis.wiki;

        for (var i = 0; i < config.wikis.wiki.length(); i++) {
	    this.addWiki(config.wikis.wiki[i].name.toString(), config.wikis.wiki[i].root.toString());
	    if (config.wikis.wiki[i].@selected && config.wikis.wiki[i].@selected == "true") {
                // If this is the selected wiki, set it
                this.selectedWiki = this.wikis[this.wikis.length-1];
	    }
	}
    },

    saveConfig: function () {
	// Remove all the children of the wikinotepad XML
	this.wikinotepad.wikis.setChildren(new XMLList());

        for (var i=0; i < this.wikis.length; i++) {
	    var wk = <wiki>
	        <name>{this.wikis[i].name}</name>
	        <root>{this.wikis[i].root}</root>
	    </wiki>;

	    if (this.selectedWiki && this.wikis[i] == this.selectedWiki) {
                wk.@selected="true";
            }

	    this.wikinotepad.wikis.appendChild(wk);
        }

        var data = this.wikinotepad.toXMLString();

        try {
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                createInstance(Components.interfaces.nsIFileOutputStream);
            var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
            foStream.init(this.file, flags, 0664, 0);
            foStream.write(data, data.length);
            foStream.close();
	} catch (e) {
            Components.utils.reportError(e);
	}
    },

    addWiki: function (name, root) {
        var w = {
	    name: name,
	    root: root
	};
	this.wikis[this.wikis.length] = w;
    },

    openWiki: function (wiki) {
        // Load the wiki Main page in the wiki browser
	// todo Make the Main.wnp a variable
        var uri = "file:///" + wiki.root + "/Main.wnp";
        document.getElementById("wikinotepadBrowser").loadURI(uri);
        // Hide the default content and wiki editing controls
        document.getElementById("wikinotepadNoContent").style.display = "none";
        this.selectedWiki = wiki;
    },

    editWikiPage: function() {
        window.openDialog("chrome://wikinotepad/content/editwikipage.xul", "wikiNotepadEditPage", "resizable,dialog,centerscreen,modal", this, document.getElementById("wikinotepadBrowser"));
    },

    openCreateWikiWizard: function () {
        window.openDialog("chrome://wikinotepad/content/wizard.xul", "wikiNotepadWizard", "resizable,dialog,centerscreen,modal", this);
	this.saveConfig();
    },

    openManageWikis: function () {
        window.openDialog("chrome://wikinotepad/content/manage.xul", "manageWikisDialog", "resizable,dialog,centerscreen,modal", this);
	this.saveConfig();
    }
};
