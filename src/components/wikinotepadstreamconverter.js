/* 
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is the wmlbrowser extension.
 * 
 * The Initial Developer of the Original Code is Matthew Wilson
 * <matthew@mjwilson.demon.co.uk>. Portions created by the Initial Developer
 * are Copyright (C) 2004 the Initial Developer. All Rights Reserved.
 *
 * The Original Code has been modified to support XHTML mobile profile.
 * The modified code is Copyright (C) 2006 Gareth Hunt.
 *
 * Contributor(s): 
 *
 * This file contains the content handler for converting content of type
 * application/vnd.wap.xhttml+xml (XHTMLMPStreamConverter)
 */

/* application/x-wikinotepad -> text/html stream converter */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const ci = Components.interfaces;

const WIKINP_CLASS_DESCRIPTION = "Wiki Notepad to HTML stream converter";
const WIKINP_CLASS_ID = Components.ID("{191dbdf0-f7e3-11de-8a39-0800200c9a66}");
const WIKINP_CONVERSION = "?from=application/x-wikinotepad&to=*/*";
const WIKINP_CONTRACT_ID = "@mozilla.org/streamconv;1";

function WikiNotepadStreamConverter () {}

WikiNotepadStreamConverter.prototype = {

  // properties required for XPCOM registration:
  classDescription: WIKINP_CLASS_DESCRIPTION,
  classID:          WIKINP_CLASS_ID,
  contractID:       WIKINP_CONTRACT_ID + WIKINP_CONVERSION,

  _xpcom_categories: [{
    category: WIKINP_CONTRACT_ID,
    entry: WIKINP_CONVERSION,
    value: WIKINP_CLASS_DESCRIPTION
  }],

  QueryInterface: XPCOMUtils.generateQI([ci.nsIStreamConverter, ci.nsIStreamListener, ci.nsIRequestObserver]),
  
  /*QueryInterface: function (iid) {

    if (iid.equals(ci.nsISupports) ||
      iid.equals(ci.nsIStreamConverter) ||
      iid.equals(ci.nsIStreamListener) ||
      iid.equals(ci.nsIRequestObserver))
      return this;

    throw Components.results.NS_ERROR_NO_INTERFACE
  },*/

  init: function() {
    if (!this.creole) {
      dump("\nCreating Creole parser\n");
      // Load the creole wiki parser
      // this.ns = {};
      // Components.utils.import("resource://wikinotepad/creole.jsm", this.ns);
      Components.utils.import("resource://wikinotepad/creole.jsm");

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
        dump("Error: " + e.message + "\n");
      }
    }
  },

  // nsIRequest::onStartRequest
  onStartRequest: function(aRequest, aContext) {
    //dump("SidebarWikiStreamConverter.onStartRequest\n")
    this.init();

    try {    
    this.data = ''

    this.uri = aRequest.QueryInterface(ci.nsIChannel).URI.spec

    this.channel = aRequest
    
    this.channel.contentType = "text/html"
    this.channel.contentCharset = "UTF-8";

    this.listener.onStartRequest (this.channel, aContext);
    }
    catch (e) {
      dump(e.description);
    }
  },

  // nsIRequest::onStopRequest
  onStopRequest: function (aRequest, aContext, aStatusCode) {
    /*var tempData = this.data

    // Strip leading whitespace
    tempData = tempData.replace (/^\s+/,'')
    
    // Strip out comments
    tempData = tempData.replace (/<!(?:--.*?--\s*)?>/,'')
    
    // Replace <html> with <html xmlns="http://www.w3.org/1999/xhtml">
    tempData = tempData.replace (/<html>/,'<html xmlns="http://www.w3.org/1999/xhtml">')
    
    // Prepend </title> with [XHTML-MP]
    tempData = tempData.replace (/<\/title>/,' [XHTML-MP]</title>')
    
    this.data = tempData */
    
    // var targetDocument = ""
    // targetDocument = targetDocument + this.data
    try {
    // Create an E4X object to pass into the parser
    var html = <html>
  <head>
    <title>Wiki Notepad Test</title>
  </head>
  <body>
  </body>
</html>;
    
    this.creole.parse(html.body, this.data);

    //dump("html: " + html.toXMLString() + "\n");
    
    //var targetDocument = this.data
    //var targetDocument = '';
    var targetDocument = html.toXMLString();

    var sis = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(ci.nsIStringInputStream)
    sis.setData (targetDocument, targetDocument.length)

    // Pass the data to the main content listener
    this.listener.onDataAvailable (this.channel, aContext, sis, 0, targetDocument.length);
    this.listener.onStopRequest (this.channel, aContext, aStatusCode);
    }
    catch (e) {
      dump("onStopRequest Error: " + e.message + "\n");
    }
  },

  // nsIStreamListener methods
  onDataAvailable: function (aRequest, aContext, aInputStream, aOffset, aCount) {
    try {
    var si = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance()
    si = si.QueryInterface(Components.interfaces.nsIScriptableInputStream)
    si.init(aInputStream)
    this.data += si.read(aCount)
    dump ("this.data: " + this.data + "\n");
    } catch (e) {
      dump("Error (onDataAvailable):" + e.description + "\n")
    }
  },
  
  asyncConvertData: function (aFromType, aToType, aListener, aCtxt) {
    // Store the listener passed in
    this.listener = aListener
  },
  
  convert: function (aFromStream, aFromType, aToType, aCtxt) {
    return aFromStream
  }
};

var components = [WikiNotepadStreamConverter];

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}

