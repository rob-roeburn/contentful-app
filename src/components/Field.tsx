import React, {useEffect, useState, useRef} from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import { Editor } from '@tinymce/tinymce-react';
import Showdown from 'showdown';
import TurndownService from 'turndown';
//import {gfm} from 'turndown-plugin-gfm';
let turndownPluginGfm = require('turndown-plugin-gfm')

Showdown.extension("noLineBreakLists", function() {
  return [
    {
        type    : 'html',
        regex   : '</p>\n<ul>',
        replace : '</p><p><ul>'
    }
  ]
});

Showdown.extension("paraBlockAd", function() {
  return [
    {
        type    : 'html',
        regex   : '<p class=\"inline ad\"><\/p>',
        replace : '<p><img src="https://images.ctfassets.net/srdmz6yont2x/3iXSFZjvoEjg7or343xHeH/e31d76e702ed5956fd21eeed97ddfa19/ad_placeholder.png?h=250" alt="Ad Placeholder"></p>'
    }
  ]
});

const converter = new Showdown.Converter();
converter.useExtension("noLineBreakLists");
converter.useExtension("paraBlockAd");
converter.setOption('simpleLineBreaks', true);
const turndownService = new TurndownService();
let gfm = turndownPluginGfm.gfm
turndownService.use(gfm)

interface FieldProps { sdk: FieldExtensionSDK; }

let mainRef = React.createRef<Editor>();

let value = "";

const Field = (props: FieldProps) => {
  const [value, setValue] = useState('');

  useEffect (()=> {                           // useEffect for debounce hook
    if (value==='') {                         // Initial load of CMS - update quill
      props.sdk.space.getEntry(props.sdk.entry.getSys().id)
      .then((entryRef: any) => {
        if (typeof(entryRef.fields.Body)!='undefined') {
          setValue(converter.makeHtml(entryRef.fields.Body.en));
        } else {
          entryRef.fields.Body = {};
          entryRef.fields.Body.en = '';
          setValue(converter.makeHtml(entryRef.fields.Body.en));
        }
      });
    } else {                                  // Component updated
      let debouncetimer = setTimeout(() => {  // Initiate debounce timer
        let now = new Date().toJSON();
        props.sdk.space.getEntry(props.sdk.entry.getSys().id)
        .then((entryRef: any) => {
          if(value==="<p><br></p>") {
            // Intercept write of breakspaces
            if (typeof(entryRef.fields.Body)!='undefined') {
              entryRef.fields.Body.en = turndownService.turndown("<p><br>&nbsp;<br>&nbsp;<br></p>");
            } else {
              entryRef.fields.Body = {};
              entryRef.fields.Body.en = turndownService.turndown("<p><br>&nbsp;<br>&nbsp;<br></p>");
            }
          } else {
            let newEntry = turndownService.turndown(value)
            console.log(newEntry)
            newEntry = newEntry.replace('![](https://images.ctfassets.net/srdmz6yont2x/2wXVLCDB2oTwQYqFhdwHWc/4038621ecfbebdf5da25de515d66a6a8/ad_placeholder.png?h=250)', '<p class="inline ad"></p>');
            if (typeof(entryRef.fields.Body)!='undefined') {
              entryRef.fields.Body.en = newEntry;
            } else {
              entryRef.fields.Body = {};
              entryRef.fields.Body.en = newEntry;
            }
          }
          if (JSON.stringify(entryRef.fields.Body)==='{"en":""}') {
            entryRef.fields.Body.en = " ";
          }
          let entrySys=props.sdk.entry.getSys()
          let entryPublished=false
          if (entrySys.version<(entrySys.publishedVersion+2)) {
            entryPublished=true
          }
          props.sdk.field.setValue(entryRef.fields.Body.en);
          console.log("Updating CMS from test rich editor localhost : "+now);
        })
      }, 750)                                 // Return timer and only fire after 750ms
      return () => {                          // Reset timeout for each state change
        clearTimeout(debouncetimer);
      }
    }
  })

  props.sdk.window.startAutoResizer();

  const editorRef = useRef(null);
  return <div>
    <Paragraph>
      <Editor
      value={value}
      onEditorChange={setValue}
      init={{
        height: 500,
        menubar: 'table',
        plugins: ['table link image autolink'],
        table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        //plugins: [
        //  'advlist autolink lists link image charmap print preview anchor',
        //  'searchreplace visualblocks code fullscreen',
        //  'insertdatetime media table paste code help wordcount'
        //],
        toolbar: 'formatselect | bold italic | numlist bullist | outdent indent | ' +
        ' link | autolink | image | undo redo | help',

        file_picker_callback: function(callback, value, meta) {
          //let valueRef=String(mainRef.current!.value);
          console.log(editorRef)
          console.log("2")
        }
        //content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
    />
    </Paragraph>
</div>;
};

export default Field;
