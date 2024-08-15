sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/upload/UploadSetwithTable","sap/m/upload/UploadSetwithTableItem","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","sap/ui/model/json/JSONModel","sap/m/MessageBox"],function(e,t,n,o,s,i,a,l){"use strict";return e.extend("capaichatui.controller.LeftScreen",{onInit:function(){this.getUserInfo();this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();this.oRouter.getRoute("home").attachPatternMatched(this.onRouteMatched,this);this.oRouter.getRoute("conversation").attachPatternMatched(this.onRouteMatched,this)},onRouteMatched(e){this.getView().byId("leftScreenChatList").getBinding("items").refresh()},onConversationPress:function(e){const t=e.getParameter("listItem");const n=t.getBindingContext().getProperty("cID");const o=this.getOwnerComponent().getRouter();o.navTo("conversation",{conversationID:n})},onHandleConversationDelete:function(e){const t=e.getParameter("listItem");const n=t.getBindingContext().getProperty("cID");const o=t.getBindingContext().getProperty("title").toString();const s=this.getOwnerComponent().getRouter();const a=s.getHashChanger().getHash();const r=s.getRouteInfoByHash(a);l.warning(`This will delete ${o}`,{icon:l.Icon.WARNING,actions:["Remove",l.Action.CANCEL],emphasizedAction:"Remove",styleClass:"sapMUSTRemovePopoverContainer",initialFocus:l.Action.CANCEL,onClose:e=>{if(e!=="Remove"){return}this.requestConversationDelete(n).then(e=>{i.show(`Conversation successfully deleted.`);if(r.name!=="home"){this.oRouter.navTo("home")}else{this.getView().byId("leftScreenChatList").getBinding("items").refresh()}}).catch(e=>{console.log(e);i.show(`Conversation deletion failed.`)})}})},requestConversationDelete:function(e){const t={url:this.getBaseURL()+`/odata/v4/chat/Conversation(${e})`,method:"DELETE",headers:{"Content-type":"application/json"}};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onCreateNewChat:function(e){const t=this.getOwnerComponent().getRouter();t.navTo("home")},onUploadFileBtnSelect:function(e){this.fileUploadFragment??=this.loadFragment({name:"capaichatui.view.FileUploading"});this.fileUploadFragment.then(e=>e.open())},onCloseUploadFileFragment:function(){this.byId("fileUploadFragment").close()},onManageFileBtnSelect:function(){this.fileManagementFragment??=this.loadFragment({name:"capaichatui.view.FileManagement"});this.fileManagementFragment.then(e=>e.open())},onCloseManageFileFragment:function(){this.byId("fileManagementFragment").close()},onAfterItemAdded:function(e){console.log(e);const t=e.getParameter("item");this.createEntity(t).then(e=>{this.uploadContent(t,e)}).catch(e=>{console.log(e)})},onUploadCompleted:function(e){var t=this.byId("uploadSet");t.removeAllIncompleteItems();t.getBinding("items").refresh()},createEntity:function(e){const t={ID:self.crypto.randomUUID(),mediaType:e.getMediaType(),fileName:e.getFileName(),size:e.getFileObject().size.toString()};const n={url:this.getBaseURL()+"/odata/v4/embedding-storage/Files",method:"POST",headers:{"Content-type":"application/json"},data:JSON.stringify(t)};return new Promise((e,t)=>{$.ajax(n).done((t,n,o)=>{e(t.ID)}).fail(e=>{t(e)})})},uploadContent:function(e,t){var n=this.getBaseURL()+`/odata/v4/embedding-storage/Files(${t})/content`;e.setUploadUrl(n);var o=this.byId("uploadSet");o.setHttpRequestMethod("PUT");o.uploadItem(e)},onSelectionChange:function(e){const t=e.getSource();const n=t.getSelectedItems();const o=this.byId("downloadSelectedButton");const s=this.byId("deleteSelectedButton");if(n.length>0){o.setEnabled(true);s.setEnabled(true)}else{o.setEnabled(false);s.setEnabled(false)}},getIconSrc:function(e,n){return t.getIconForFileType(e,n)},getFileSizeWithUnits:function(e){return t.getFileSizeWithUnits(e)},onFileNameSearch:function(e){const t=[];const n=e.getSource().getValue();if(n&&n.length>0){const e=new o("fileName",s.Contains,n);t.push(e)}const i=this.byId("uploadSetWithTable");const a=i.getBinding("items");a.filter(t,"Application")},onDownloadFiles:function(e){const t=this.byId("uploadSetWithTable");const n=t.getSelectedItem();const o=n.mAggregations;const s=o.cells[1].getProperty("text");const i=n.getProperty("fileName");this.requestFileDownload(s).then(e=>{var t=window.URL.createObjectURL(e);var n=document.createElement("a");n.href=t;n.setAttribute("download",i);document.body.appendChild(n);n.click();document.body.removeChild(n)}).catch(e=>{console.log(e)})},requestFileDownload:function(e){const t={url:this.getBaseURL()+`/odata/v4/embedding-storage/Files(${e})/content`,method:"GET",xhrFields:{responseType:"blob"}};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onGenerateVectorBtnClick:function(e){let t=e.getSource();let o=null;while(t&&!(t instanceof n)){t=t.getParent()}if(t instanceof n){o=t}const s=o.mAggregations;const a=s.cells[1].getProperty("text");this.byId("fileManagementFragment").setBusy(true);this.requestEmbeddingGeneration(a).then(e=>{this.byId("fileManagementFragment").setBusy(false);i.show("Vetorização realizada com sucesso.")}).catch(e=>{this.byId("fileManagementFragment").setBusy(false);i.show("Erro na geração de Vetorização, tente denovo")})},requestEmbeddingGeneration:function(e){const t=JSON.stringify({uuid:e.toString()});return new Promise((e,n)=>{$.ajax({url:this.getBaseURL()+"/odata/v4/embedding-storage/storeEmbeddings",type:"POST",contentType:"application/json",async:true,data:t,success:function(t,o,s){console.log("Success: "+s);if(s.status===200||s.status===201){e(s.responseJSON)}else{n(s.responseJSON)}},error:function(e,t){console.log("Fail: "+e);if(e){if(e.responseJSON){const t=e.responseJSON.message||e.responseJSON.status_msg;n(t)}else{n(e.responseText)}}else{n(t)}}})})},onBeforeOpenContextMenu:function(e){this.byId("uploadSetWithTable").getBinding("items").refresh()},beforeFileManagementDialogOpen:function(e){this.byId("uploadSetWithTable").getBinding("items").refresh()},onDeleteFiles:function(e){this.byId("fileManagementFragment").setBusy(true);const t=this.byId("uploadSetWithTable");const n=t.getSelectedItem();const o=n.mAggregations;const s=o.cells[1].getProperty("text");const a=n.getProperty("fileName");this.requestFileDelete(s).then(e=>{this.byId("fileManagementFragment").setBusy(false);this.byId("uploadSetWithTable").getBinding("items").refresh();this.byId("uploadSet").getBinding("items").refresh();const t=this.byId("downloadSelectedButton");const n=this.byId("deleteSelectedButton");t.setEnabled(false);n.setEnabled(false);i.show(`File ${a} with ID ${s} successfully deleted`)}).catch(e=>{console.log(e.message);this.byId("fileManagementFragment").setBusy(false);i.show(`File ${a} with ID ${s} deletion failed`)})},requestFileDelete:function(e){const t={url:this.getBaseURL()+`/odata/v4/embedding-storage/Files(${e})`,method:"DELETE"};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onDeleteEmbedding:function(e){this.byId("fileManagementFragment").setBusy(true);this.requestEmbeddingDelete().then(e=>{this.byId("fileManagementFragment").setBusy(false);i.show(`All embeddings successfully deleted.`)}).catch(e=>{console.log(e.message);this.byId("fileManagementFragment").setBusy(false);i.show(`Embeddings deletion failed.`)})},requestEmbeddingDelete:function(){const e={url:this.getBaseURL()+"/odata/v4/embedding-storage/deleteEmbeddings()",method:"GET"};return new Promise((t,n)=>{$.ajax(e).done((e,n,o)=>{t(e)}).fail(e=>{n(e)})})},getUserInfo:function(){const e=this.getBaseURL()+"/user-api/currentUser";var t=new a;var n={firstname:"Dummy",lastname:"User",email:"dummy.user@com",name:"dummy.user@com",displayName:"Dummy User (dummy.user@com)"};t.loadData(e);t.dataLoaded().then(()=>{console.log(t.getData());if(!t.getData().email){t.setData(n)}this.getView().setModel(t,"userInfo")}).catch(()=>{t.setData(n);this.getView().setModel(t,"userInfo")})},getBaseURL:function(){var e=this.getOwnerComponent().getManifestEntry("/sap.app/id");var t=e.replaceAll(".","/");var n=jQuery.sap.getModulePath(t);return n}})});