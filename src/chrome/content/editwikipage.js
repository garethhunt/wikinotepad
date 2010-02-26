Components.utils.import("resource://wikinotepad/creole.jsm");

var WikiNotepadEditPage = {

    init: function () {

        try {
            this.creole = new Parse.Simple.Creole( {
                interwiki: {
                    WikiCreole: 'http://www.wikicreole.org/wiki/',
                    Wikipedia: 'http://en.wikipedia.org/wiki/'
                },
                linkFormat: '',
	        builder: 'e4x'
            } );
        } catch (e) {
            Components.utils.reportError(e);
            dump("Error: " + e.message + "\n");
        }

        this.WikiNotepad = window.arguments[0];
        this.browser = window.arguments[1];
	var data = this.loadContent(this.browser.currentURI);
        document.getElementById("wikinotepadTextbox").value = data;
        this.updatePreview(data);
    },

    loadContent: function (uri) {
	this.file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
	var data = new String();

        if (this.file.exists()) {
            try {
		var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
		var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
		    createInstance(Components.interfaces.nsIScriptableInputStream);
		fiStream.init(this.file, 1, 0, false);
		siStream.init(fiStream);
		data += siStream.read(-1);
		siStream.close();
		fiStream.close();
            } catch(e) {
		Components.utils.reportError(e);
            }
        } else {
	    data = "Error loading document: " + uri.spec;
	}
	return data;
    },

    updatePreview: function (data) {
	document.getElementById("wikinotepadPreview").contentDocument.body.innerHTML = this.parseWikiSyntax(data);
    },

    parseWikiSyntax: function (data) {
        var div = <div>
                  </div>;

        this.creole.parse(div, data);
	return div.toXMLString();
    },

    textChanged: function (textbox) {
        this.updatePreview(textbox.value)
    },

    saveContent: function () {
	var data = document.getElementById("wikinotepadTextbox").value;
	
	// Write the content to the file and close
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
	
	// For some reason, the reload method does not work as expected
        this.browser.loadURI(this.browser.currentURI.spec);
	return true;
    }
};
