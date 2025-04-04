var mouseX = 0;
var mouseY = 0;
//#(10000) programmer code begin;
//#(10000) programmer code end;
$(function(){
	$(this).mousedown(function(e) { mouseX = e.pageX; mouseY = e.pageY; });
	try { startApplication("emte001"); }catch(ex) { }
	initialApplication();
	//#(20000) programmer code begin;
	//#(20000) programmer code end;
});
function initialApplication() {
	//#(30000) programmer code begin;
	//#(30000) programmer code end;
	setupComponents();
	setupAlertComponents();
	//#(40000) programmer code begin;
	setupInputs();
	//#(40000) programmer code end;
}
function setupComponents() {
	//#(50000) programmer code begin;
	//#(50000) programmer code end;
	$("#searchbutton").click(function(evt) {
		resetFilters();
		search();  return false;
	});
	$("#insertbutton").click(function(evt) {
		insert();  return false;
	});
	$("#savebutton").click(function() {
		disableControls($("#savebutton"));
		save();  return false;
	});
	$("#cancelbutton").click(function() {
		cancel();  return false;
	});
	$("#updatebutton").click(function() {
		disableControls($("#updatebutton"));
		update();  return false;
	});
	$("#deletebutton").click(function() {
		disableControls($("#deletebutton"));
		deleted();  return false;
	});
	//#(60000) programmer code begin;
	$("#addquestion").click(function() { addNewQuestion(); });
	//#(60000) programmer code end;
}
function resetFilters() {
	try { 
		fssearchform.page.value = "1";
		fssearchform.orderBy.value = "";
		fssearchform.orderDir.value = "";
	}catch(ex) { }	
}
function refreshFilters() {
	try { 
		fssearchform.page.value = fslistform.page.value;
		fssearchform.orderBy.value = fschapterform.orderBy.value;
		fssearchform.orderDir.value = fschapterform.orderDir.value;
	}catch(ex) { }	
}
function ensurePaging(tablebody) {
	if(!tablebody) tablebody = "#datatablebody";
	try {
		let pageno = parseInt(fslistform.page.value);
		let size = $(tablebody).find("tr").length;
		if(size<=1 && pageno>1) {
			fslistform.page.value = ""+(pageno-1);
		}
	} catch(ex) { }
}
function search(aform) {
	//#(70000) programmer code begin;
	//#(70000) programmer code end;
	if(!aform) aform = fssearchform;
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/search",
		data: formdata.jsondata,
		headers : formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			searchComplete(transport,data);
		}
	});	
	//#(80000) programmer code begin;
	//#(80000) programmer code end;
}
function searchComplete(xhr,data) {
	$("#listpanel").data("searchfilters",createParameters(fssearchform));
	//#(90000) programmer code begin;
	//#(90000) programmer code end;
	stopWaiting();
	$("#listpanel").html(data);
	setupDataTable();
	//#(100000) programmer code begin;
	//#(100000) programmer code end;
}
function insert() {
	//#(110000) programmer code begin;
	//#(110000) programmer code end;
	let aform = fslistform;
	aform.taskid.value = "";
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/add",
		data: formdata.jsondata,
		headers : formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#dialogpanel").html(data);
			setupDialogComponents();
			$("#fsmodaldialog_layer").modal("show");
		}
	});
	return false;
	//#(120000) programmer code begin;
	//#(120000) programmer code end;
}
function clearingFields() {
	//#(130000) programmer code begin;
	//#(130000) programmer code end;
	fsentryform.reset();
	//#(140000) programmer code begin;
	//#(140000) programmer code end;
}
function cancel() {
	//#(150000) programmer code begin;
	//#(150000) programmer code end;
	confirmCancel(function() {
		clearingFields();
		window.close();
	});
	//#(160000) programmer code begin;
	//#(160000) programmer code end;
}
function validSaveForm(callback) {
	//#(170000) programmer code begin;
	//#(170000) programmer code end;
	return validRequiredFields(callback,fs_requiredfields);
	//#(180000) programmer code begin;
	//#(180000) programmer code end;
}
function save(aform) {
	//#(190000) programmer code begin;
	fs_requiredfields = {
		"taskid":{msg:""}, 
		"taskname":{msg:""}, 
	};
	invalidateJSONSetting();
	let vi = validateJSONSettings();
	if(!vi.valid) {
		$(vi.validator).focus();	
		$(vi.validator).parent().addClass("has-error");
		$(vi.validator+"_alert").show();
		if(vi.validid) {
			$("#linker_"+vi.validid).trigger("click");
		}
		return;
	}
	scrapeModels();
	//#(190000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(195000) programmer code begin;
		//#(195000) programmer code end;
		confirmSave(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/emte001/insert",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){
					stopWaiting();
					//#(195300) programmer code begin;
					//#(195300) programmer code end;
					successbox(function() {
						$("#fsmodaldialog_layer").modal("hide");
					});
					//#(195500) programmer code begin;
					refreshFilters();
					search();
					//#(195500) programmer code end;
				}
			});
		});
	});
	return false;
	//#(200000) programmer code begin;
	//#(200000) programmer code end;
}
function update(aform) {
	//#(230000) programmer code begin;
	fs_requiredfields = {
		"taskid":{msg:""}, 
		"taskname":{msg:""}, 
	};
	invalidateJSONSetting();
	let vi = validateJSONSettings();
	if(!vi.valid) {
		$(vi.validator).focus();	
		$(vi.validator).parent().addClass("has-error");
		$(vi.validator+"_alert").show();
		if(vi.validid) {
			$("#linker_"+vi.validid).trigger("click");
		}
		return;
	}
	scrapeModels();
	//#(230000) programmer code end;
	if(!aform) aform = fsentryform;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(235000) programmer code begin;
		//#(235000) programmer code end;
		confirmUpdate(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/emte001/update",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){ 
					stopWaiting();
					//#(235300) programmer code begin;
					//#(235300) programmer code end;
					successbox(function() { 
						$("#fsmodaldialog_layer").modal("hide");
					});
					//#(235500) programmer code begin;
					refreshFilters();
					search();
					//#(235500) programmer code end;
				}
			});
		});
	});
	return false;
	//#(240000) programmer code begin;
	//#(240000) programmer code end;
}
function submitRetrieve(src,taskid) {
	//#(250000) programmer code begin;
	//#(250000) programmer code end;
	let aform = fslistform;
	aform.taskid.value = taskid;
	let formdata = serializeDataForm(aform);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/retrieval",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#dialogpanel").html(data);
			setupDialogComponents();
			$("#fsmodaldialog_layer").modal("show");
		}
	});
	return false;
	//#(260000) programmer code begin;
	//#(260000) programmer code end;
}
function submitChapter(aform,index) {
	let fs_params = fetchParameters($("#listpanel").data("searchfilters"));
	//#(270000) programmer code begin;
	//#(270000) programmer code end;
	let formdata = serializeDataForm(aform, $("#listpanel").data("searchfilters"));
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/search",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#listpanel").html(data);
			setupDataTable();
		}
	});
	//#(280000) programmer code begin;
	//#(280000) programmer code end;
}
function submitOrder(src,sorter) {
	let aform = fssortform;
	aform.orderBy.value = sorter;
	let fs_params = fetchParameters($("#listpanel").data("searchfilters"));
	let formdata = serializeDataForm(aform, $("#listpanel").data("searchfilters"));
	//#(290000) programmer code begin;
	//#(290000) programmer code end;
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/search",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			$("#listpanel").html(data);
			setupDataTable();
		}
	});
	return false;
	//#(300000) programmer code begin;
	//#(300000) programmer code end;
}
function submitDelete(src,fsParams) {
	//#(310000) programmer code begin;
	//#(310000) programmer code end;
	confirmDelete([fsParams[1]],function() {
		deleteRecord(fsParams);
	});
	//#(320000) programmer code begin;
	//#(320000) programmer code end;
}
function deleteRecord(fsParams) {
	//#(330000) programmer code begin;
	//#(330000) programmer code end;
	let params = {
		ajax: true,
		taskid : fsParams[0]
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/remove",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){
			stopWaiting();
			//#(333000) programmer code begin;
			//#(333000) programmer code end;
			ensurePaging();
			refreshFilters();
			search();
			//#(335000) programmer code begin;
			//#(335000) programmer code end;
		}
	});
	//#(340000) programmer code begin;
	//#(340000) programmer code end;
}
function deleted(aform) {
	//#(345000) programmer code begin;
	//#(345000) programmer code end;
	if(!aform) aform = fsentryform;
	confirmDelete([],function() {
		let formdata = serializeDataForm(aform);
		//#(347000) programmer code begin;
		//#(347000) programmer code end;
		startWaiting();
		jQuery.ajax({
			url: API_URL+"/api/emte001/remove",
			data: formdata.jsondata,
			headers: formdata.headers,
			type: "POST",
			dataType: "html",
			contentType: defaultContentType,
			error : function(transport,status,errorThrown) {
				submitFailure(transport,status,errorThrown);
			},
			success: function(data,status,transport){ 
				stopWaiting();
				//#(347500) programmer code begin;
				//#(347500) programmer code end;
				$("#fsmodaldialog_layer").modal("hide");
				ensurePaging();
				refreshFilters();
				search();
				//#(347700) programmer code begin;
				//#(347700) programmer code end;
			}
		});
	});
	return false;
	//#(348000) programmer code begin;
	//#(348000) programmer code end;
}
function setupDialogComponents() {
	//#(380000) programmer code begin;
	//#(380000) programmer code end;
	$("#savebutton").click(function() {
		disableControls($("#savebutton"));
		save(); return false;
	});
	$("#updatebutton").click(function() {
		disableControls($("#updatebutton"));
		update(); return false;
	});
	$("#deletebutton").click(function() {
		disableControls($("#deletebutton"));
		deleted(); return false;
	});
	setupAlertComponents($("#dialogpanel"));
	initialApplicationControls($("#dialogpanel"));
	$("#dialogpanel").find(".modal-dialog").draggable();
	//#(385000) programmer code begin;
	$("#addmodelbutton").click(function() { addNewModel(); });
	setupInputs();
	setTimeout(function() { $("#taskname").focus(); },500);
	$("input.model-name",$("#entrytabmodel")).each(function(index,element) {
		$(element).blur(function() { 
			let id = $(this).attr("data-model");
			$("#linker_"+id).html($(this).val());
		});
	});
	$("#connecteditbutton").click(function() { showEditConnection(); });
	$("#connectnewbutton").click(function() { showNewConnection(); });
	//#(385000) programmer code end;
}
var fs_requiredfields = {
	"taskid":{msg:""}, 
	"taskname":{msg:""}, 
};
//#(390000) programmer code begin;
function setupDataTable() {
	setupPageSorting("datatable",submitOrder);
	setupPagination("fschapterlayer",submitChapter,fschapterform,fssearchform);
	$("#datatablebody").find(".fa-data-edit").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			submitRetrieve(element,$(this).parent().parent().attr("data-key"));
		});
	});
	$("#datatablebody").find(".fa-data-delete").each(function(index,element) {
		$(element).click(function() {
			if($(this).is(":disabled")) return;
			submitDelete(element,[$(this).parent().parent().attr("data-key"),$(this).attr("data-name")]);
		});
	});
}
function addNewModel() {
	let params = {
		ajax: true,
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/entry",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){ 
			stopWaiting();
			let html = $(data);
			$("#entrytabmodel").append(html);
			let id = html.find("input.model-id").val();
			let name = html.find("input.model-name").val();
			let label = $("<label></label>");
			label.html(name);
			let li = $('<li class="nav-item" role="presentation"></li>');
			let alink = $('<a id="linker_'+id+'" class="nav-link model-link" href="#entrymodel_'+id+'" data-toggle="tab" data-target="#entrymodel_'+id+'" role="tab" aria-controls="entrymodel_'+id+'"></a>');
			alink.append(label);
			li.append(alink);
			let dellink = $('<span id="dellink_'+id+'" class="del-linker"><i class="fa fa-times-circle"></i></span>');
			alink.append(dellink);
			$("#fsmodeltabbar").append(li);
			html.find("input.model-name").blur(function() {
				label.html($(this).val());
			});
			dellink.click(function() {
				confirmRemoveModel([label.html()],function() {
					li.remove();
					html.remove();
					$("a.model-link:first").trigger("click");
				});
			});
			$("#linker_"+id).trigger("click");
		}
	});
}
function setupInputs() {
	$(".validate-json").each(function(index,element) { 
		let e = $(element);
		e.focus(function() {
			e.parent().removeClass("has-error");
			let id = e.attr("id");
			$("#"+id+"_alert").hide();	
		});	
	});
}
function invalidateJSONSetting() {
	$(".validate-json").each(function(index,element) { 
		let e = $(element);
		e.parent().removeClass("has-error");
		let id = e.attr("id");
		$("#"+id+"_alert").hide();
	
	});
}
function validateJSONSettings() {
	let valid = true;
	let validator = undefined;
	let validid = undefined;
	if($.trim($("#taskconfigs").val()) != "") {
		try {
			JSON.parse($("#taskconfigs").val());
		} catch(ex) {
			valid = false;
			validator = "#taskconfigs";
		}
	}
	$("div.entry-models").each(function(index,element) {
		let e = $(element);
		let id = e.attr("data-model");
		let str = $("#modelname_"+id).val();
		if($.trim(str) == "") {
			valid = false;
			if(!validator) validator = "#modelname_"+id;
			if(!validid) validid = id;
		}
		str = $("#tablename_"+id).val();
		if($.trim(str) == "") {
			valid = false;
			if(!validator) validator = "#tablename_"+id;
			if(!validid) validid = id;
		}
		str = $("#tablefields_"+id).val();		
		if($.trim(str) != "") {
			try {
				JSON.parse(str);
			} catch(ex) {
				valid = false;
				if(!validator) validator = "#tablefields_"+id;
				if(!validid) validid = id;
			}	
		}
		str = $("#tablesettings_"+id).val();
		if($.trim(str) != "") {
			try {
				JSON.parse(str);
			} catch(ex) {
				valid = false;
				if(!validator) validator = "#tablesettings_"+id;
				if(!validid) validid = id;
			}	
		}
	});
	return {valid: valid, validator: validator, validid: validid};
}
function confirmRemoveModel(params, okFn, cancelFn,  width, height) {
	if(!confirmDialogBox("QS0306",params,"Do you want to delete this model?",okFn,cancelFn,width,height)) return false;
	return true;
}
function scrapeModels() {
	let models = [];
	$("div.entry-models").each(function(index,element) {
		let e = $(element);
		let id = e.attr("data-model");
		models.push({
			modelid: id,
			modelname: $("#modelname_"+id).val(),
			tablename: $("#tablename_"+id).val(),
			tablefields: $("#tablefields_"+id).val(),
			tablesettings: $("#tablesettings_"+id).val(),
		});
	});
	$("#models").val(JSON.stringify(models));
	console.log("models",models);
}
function showEditConnection() {
	let connectid = $("#connectid").val();
	if($.trim(connectid) == "") return;
	let params = {
		ajax: true,
		connectid: connectid
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/connectretrieval",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){ 
			stopWaiting();
			$("#dialogpanelconnect").html(data);
			setupConnectionDialog();
			$("#fsmodaldialog_layerconnect").modal("show");
		}
	});
}
function showNewConnection() {
	let params = {
		ajax: true,
	};
	let formdata = serializeParameters(params);
	startWaiting();
	jQuery.ajax({
		url: API_URL+"/api/emte001/connectadd",
		data: formdata.jsondata,
		headers: formdata.headers,
		type: "POST",
		dataType: "html",
		contentType: defaultContentType,
		error : function(transport,status,errorThrown) {
			submitFailure(transport,status,errorThrown);
		},
		success: function(data,status,transport){ 
			stopWaiting();
			$("#dialogpanelconnect").html(data);
			setupConnectionDialog();
			$("#fsmodaldialog_layerconnect").modal("show");
		}
	});
}
function setupConnectionDialog() {
	$("#savebuttonconnect").click(function() {
		disableControls($("#savebuttonconnect"));
		saveConnection(); return false;
	});
	$("#updatebuttonconnect").click(function() {
		disableControls($("#updatebuttonconnect"));
		updateConnection(); return false;
	});
	setupAlertComponents($("#dialogpanelconnect"));
	initialApplicationControls($("#dialogpanelconnect"));
	$("#dialogpanelconnect").find(".modal-dialog").draggable();
	setupConnectionInputs();
}
function setupConnectionInputs() {
	fs_requiredfields = { 
		"connectname":{msg:""}, 
		"connecttype":{msg:""}, 
	};
	$("#connecttype").change(function() { 
		let val = $(this).val();
		if(val == "DB") {
			$("#dblayer").show();
			$("#apilayer").hide();
			delete fs_requiredfields["connectapi"];
			fs_requiredfields["connecturl"] = {msg:"URL is required"};
			fs_requiredfields["connectuser"] = {msg:"User is required"};
			fs_requiredfields["connectpassword"] = {msg:"Password is required"};
			fs_requiredfields["connectdatabase"] = {msg:"Database is required"};
			fs_requiredfields["connecthost"] = {msg:"Host is required"};
			fs_requiredfields["connectport"] = {msg:"Port is required"};
			$("#connectdialect").trigger("change");
		} else if(val == "API") {
			$("#apilayer").show();
			$("#dblayer").hide();
			delete fs_requiredfields["connecturl"];
			delete fs_requiredfields["connectuser"];
			delete fs_requiredfields["connectpassword"];
			delete fs_requiredfields["connectdatabase"];
			delete fs_requiredfields["connecthost"];
			delete fs_requiredfields["connectport"];
			fs_requiredfields["connectapi"] = {msg : "API is required"};
		}
		console.log("setupConnectionInputs: connecttype.change - value="+val+", fs_requiredfields",fs_requiredfields);
	}).trigger("change");
	$("#connectdialect").change(function() {
		if($("#connecttype").val()=="API") return;
		let cat = setting_dialects[$(this).val()];
		if(cat.providedflag=="1") {
			$("#providedlayer").show();
			$("#unprovidedlayer").hide();
			fs_requiredfields["connecturl"] = {msg:"URL is required"};
			fs_requiredfields["connectuser"] = {msg:"User is required"};
			fs_requiredfields["connectpassword"] = {msg:"Password is required"};
			fs_requiredfields["connectdatabase"] = {msg:"Database is required"};
			fs_requiredfields["connecthost"] = {msg:"Host is required"};
			fs_requiredfields["connectport"] = {msg:"Port is required"};
		} else {
			$("#providedlayer").hide();
			$("#unprovidedlayer").show();
			delete fs_requiredfields["connecturl"];
			delete fs_requiredfields["connectuser"];
			delete fs_requiredfields["connectpassword"];
			delete fs_requiredfields["connectdatabase"];
			delete fs_requiredfields["connecthost"];
			delete fs_requiredfields["connectport"];
		}
		if(cat.urlflag=="1") {
			$("#urllayer").show();
			$("#unurllayer").hide();
			delete fs_requiredfields["connectuser"];
			delete fs_requiredfields["connectpassword"];
			delete fs_requiredfields["connectdatabase"];
			delete fs_requiredfields["connecthost"];
			delete fs_requiredfields["connectport"];
			if($("#connecttype").val()=="DB") {
				fs_requiredfields["connecturl"] = {msg:"URL is required"};
			}
		} else {
			$("#urllayer").hide();
			$("#unurllayer").show();
			delete fs_requiredfields["connecturl"];
			if($("#forumtype").val()=="DB") {
				fs_requiredfields["connectuser"] = {msg:"User is required"};
				fs_requiredfields["connectpassword"] = {msg:"Password is required"};
				fs_requiredfields["connectdatabase"] = {msg:"Database is required"};
				fs_requiredfields["connecthost"] = {msg:"Host is required"};
				fs_requiredfields["connectport"] = {msg:"Port is required"};
			}
		}
		console.log("setupConnectionInputs: connectdialect.change - cat="+$(this).val()+", fs_requiredfields",fs_requiredfields);
	}).trigger("change"); 
	$("#connectsetting").focus(function() {
		$(this).parent().removeClass("has-error");
		$("#connectsetting_alert").hide();
	});
	$("#connectbody").focus(function() {
		$(this).parent().removeClass("has-error");
		$("#connectbody_alert").hide();
	});
}
function validJSONSetting(source) {
	if($("#connecttype").val()=="API" && $.trim($(source).val()).length>0) {
		try {
			JSON.parse($(source).val());
		} catch(ex) {
			return false;
		}
	}
	return true;
}
function saveConnection(aform) {
	if(!aform) aform = fsentryformconnect;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		//#(195000) programmer code begin;
		if(!validConnetionSettings()) return;
		//#(195000) programmer code end;
		confirmSave(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/emte001/connectinsert",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){
					stopWaiting();
					successbox(function() {
						$("#fsmodaldialog_layerconnect").modal("hide");
					});
					let pv = $("#dialogconnectid").val();
					let pt = $("#connectname").val();
					$("<option value='"+pv+"'>"+pt+"</option>").appendTo($("#connectid"));
				}
			});
		});
	});
	return false;
}
function updateConnection(aform) {
	if(!aform) aform = fsentryformconnect;
	if(!validNumericFields(aform)) return false;
	validSaveForm(function() {
		if(!validConnetionSettings()) return;
		confirmUpdate(function() {
			let formdata = serializeDataForm(aform);
			startWaiting();
			jQuery.ajax({
				url: API_URL+"/api/emte001/connectupdate",
				data: formdata.jsondata,
				headers : formdata.headers,
				type: "POST",
				dataType: "html",
				contentType: defaultContentType,
				error : function(transport,status,errorThrown) {
					submitFailure(transport,status,errorThrown);
				},
				success: function(data,status,transport){ 
					stopWaiting();
					successbox(function() { 
						$("#fsmodaldialog_layerconnect").modal("hide");
					});
				}
			});
		});
	});
	return false;
}
function validConnetionSettings() {
	let validator;
	let validsetting = validJSONSetting("#connectsetting");
	let validbody = validJSONSetting("#connectbody");
	if(!validsetting) {			
		validator = "#connectsetting";
		$("#connectsetting").parent().addClass("has-error");
		$("#connectsetting_alert").show();
	}
	if(!validbody) {
		if(!validator) validator = "#connectbody";
		$("#connectbody").parent().addClass("has-error");
		$("#connectbody_alert").show();
	}
	if(!validsetting || !validbody) {
		$(validator).focus();	
		return false;
	}
	return true;
}
//#(390000) programmer code end;
