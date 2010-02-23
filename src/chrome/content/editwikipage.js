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
	var data = this.loadContent(this.browser.currentURI)
        document.getElementById("wikinotepadTextbox").value = data;
        this.updatePreview(data);
    },

    loadContent: function (uri) {
	var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
	var data = new String();

        if (file.exists()) {
            try {
		var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
		var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
		    createInstance(Components.interfaces.nsIScriptableInputStream);
		fiStream.init(file, 1, 0, false);
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
    }
};
