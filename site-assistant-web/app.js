const { TaskStatus, IssueStatus, IssueSeverity } = window.SiteAssistantApi;

const elements = {
  summaryCards: document.querySelector("#summary-cards"),
  sourceBadge: document.querySelector("#source-badge"),
  dayBadge: document.querySelector("#day-badge"),
  nextTaskText: document.querySelector("#next-task-text"),
  nextIssueText: document.querySelector("#next-issue-text"),
  todayReportText: document.querySelector("#today-report-text"),
  workAreaList: document.querySelector("#work-area-list"),
  taskList: document.querySelector("#task-list"),
  issueList: document.querySelector("#issue-list"),
  reportList: document.querySelector("#report-list"),
  quantityList: document.querySelector("#quantity-list"),
  designQuantityList: document.querySelector("#design-quantity-list"),
  resourceList: document.querySelector("#resource-list"),
  designSpatialList: document.querySelector("#design-spatial-list"),
  terrainList: document.querySelector("#terrain-list"),
  detailPanelContent: document.querySelector("#detail-panel-content"),
  taskFilter: document.querySelector("#task-filter"),
  taskWorkAreaFilter: document.querySelector("#task-work-area-filter"),
  taskSearch: document.querySelector("#task-search"),
  issueFilter: document.querySelector("#issue-filter"),
  issueSeverityFilter: document.querySelector("#issue-severity-filter"),
  issueWorkAreaFilter: document.querySelector("#issue-work-area-filter"),
  issueSearch: document.querySelector("#issue-search"),
  reportDayFilter: document.querySelector("#report-day-filter"),
  reportWorkAreaFilter: document.querySelector("#report-work-area-filter"),
  reportSearch: document.querySelector("#report-search"),
  quantityWorkAreaFilter: document.querySelector("#quantity-work-area-filter"),
  quantityStatusFilter: document.querySelector("#quantity-status-filter"),
  quantitySearch: document.querySelector("#quantity-search"),
  designQuantityWorkAreaFilter: document.querySelector("#design-quantity-work-area-filter"),
  designQuantitySearch: document.querySelector("#design-quantity-search"),
  designSpatialWorkAreaFilter: document.querySelector("#design-spatial-work-area-filter"),
  designSpatialTypeFilter: document.querySelector("#design-spatial-type-filter"),
  designSpatialSearch: document.querySelector("#design-spatial-search"),
  terrainTypeFilter: document.querySelector("#terrain-type-filter"),
  terrainCoordFilter: document.querySelector("#terrain-coord-filter"),
  terrainSearch: document.querySelector("#terrain-search"),
  resourceWorkAreaFilter: document.querySelector("#resource-work-area-filter"),
  resourceTypeFilter: document.querySelector("#resource-type-filter"),
  resourceSearch: document.querySelector("#resource-search"),
  quantitySummary: document.querySelector("#quantity-summary"),
  logOutput: document.querySelector("#log-output"),
  entryForm: document.querySelector("#entry-form"),
  entryType: document.querySelector("#entry-type"),
  entryTitle: document.querySelector("#entry-title"),
  entryOwner: document.querySelector("#entry-owner"),
  entryWorkArea: document.querySelector("#entry-work-area"),
  entryNotes: document.querySelector("#entry-notes"),
  entryLoadSelected: document.querySelector("#entry-load-selected"),
  workAreaForm: document.querySelector("#work-area-form"),
  workAreaName: document.querySelector("#work-area-name"),
  workAreaType: document.querySelector("#work-area-type"),
  workAreaSubtype: document.querySelector("#work-area-subtype"),
  workAreaOwner: document.querySelector("#work-area-owner"),
  workAreaPlanned: document.querySelector("#work-area-planned"),
  workAreaActual: document.querySelector("#work-area-actual"),
  workAreaDescription: document.querySelector("#work-area-description"),
  workAreaLoadSelected: document.querySelector("#work-area-load-selected"),
  quantityForm: document.querySelector("#quantity-form"),
  quantityWorkArea: document.querySelector("#quantity-work-area"),
  quantityItemName: document.querySelector("#quantity-item-name"),
  quantityItemCode: document.querySelector("#quantity-item-code"),
  quantityCategory: document.querySelector("#quantity-category"),
  quantityUnit: document.querySelector("#quantity-unit"),
  quantityPlanned: document.querySelector("#quantity-planned"),
  quantityActual: document.querySelector("#quantity-actual"),
  quantityNotes: document.querySelector("#quantity-notes"),
  quantityLoadSelected: document.querySelector("#quantity-load-selected"),
  designQuantityForm: document.querySelector("#design-quantity-form"),
  designQuantityWorkArea: document.querySelector("#design-quantity-work-area"),
  designQuantityItemName: document.querySelector("#design-quantity-item-name"),
  designQuantityItemCode: document.querySelector("#design-quantity-item-code"),
  designQuantityCategory: document.querySelector("#design-quantity-category"),
  designQuantityUnit: document.querySelector("#design-quantity-unit"),
  designQuantityTarget: document.querySelector("#design-quantity-target"),
  designQuantityVersion: document.querySelector("#design-quantity-version"),
  designQuantityNotes: document.querySelector("#design-quantity-notes"),
  designQuantityLoadSelected: document.querySelector("#design-quantity-load-selected"),
  designSpatialForm: document.querySelector("#design-spatial-form"),
  designSpatialWorkArea: document.querySelector("#design-spatial-work-area"),
  designSpatialName: document.querySelector("#design-spatial-name"),
  designSpatialType: document.querySelector("#design-spatial-type"),
  designSpatialCoordSystem: document.querySelector("#design-spatial-coord-system"),
  designSpatialStationStart: document.querySelector("#design-spatial-station-start"),
  designSpatialStationEnd: document.querySelector("#design-spatial-station-end"),
  designSpatialBboxMinX: document.querySelector("#design-spatial-bbox-min-x"),
  designSpatialBboxMinY: document.querySelector("#design-spatial-bbox-min-y"),
  designSpatialBboxMinZ: document.querySelector("#design-spatial-bbox-min-z"),
  designSpatialBboxMaxX: document.querySelector("#design-spatial-bbox-max-x"),
  designSpatialBboxMaxY: document.querySelector("#design-spatial-bbox-max-y"),
  designSpatialBboxMaxZ: document.querySelector("#design-spatial-bbox-max-z"),
  designSpatialElevationTarget: document.querySelector("#design-spatial-elevation-target"),
  designSpatialVersion: document.querySelector("#design-spatial-version"),
  designSpatialRef: document.querySelector("#design-spatial-ref"),
  designSpatialNotes: document.querySelector("#design-spatial-notes"),
  designSpatialLoadSelected: document.querySelector("#design-spatial-load-selected"),
  terrainForm: document.querySelector("#terrain-form"),
  terrainName: document.querySelector("#terrain-name"),
  terrainType: document.querySelector("#terrain-type"),
  terrainCoordSystem: document.querySelector("#terrain-coord-system"),
  terrainBboxMinX: document.querySelector("#terrain-bbox-min-x"),
  terrainBboxMinY: document.querySelector("#terrain-bbox-min-y"),
  terrainBboxMinZ: document.querySelector("#terrain-bbox-min-z"),
  terrainBboxMaxX: document.querySelector("#terrain-bbox-max-x"),
  terrainBboxMaxY: document.querySelector("#terrain-bbox-max-y"),
  terrainBboxMaxZ: document.querySelector("#terrain-bbox-max-z"),
  terrainHeightmapRef: document.querySelector("#terrain-heightmap-ref"),
  terrainMeshRef: document.querySelector("#terrain-mesh-ref"),
  terrainTextureRef: document.querySelector("#terrain-texture-ref"),
  terrainSource: document.querySelector("#terrain-source"),
  terrainResolution: document.querySelector("#terrain-resolution"),
  terrainNotes: document.querySelector("#terrain-notes"),
  terrainLoadSelected: document.querySelector("#terrain-load-selected"),
  resourceLogForm: document.querySelector("#resource-log-form"),
  resourceWorkArea: document.querySelector("#resource-work-area"),
  resourceType: document.querySelector("#resource-type"),
  resourceCategory: document.querySelector("#resource-category"),
  resourceSubtype: document.querySelector("#resource-subtype"),
  resourceName: document.querySelector("#resource-name"),
  resourceQuantity: document.querySelector("#resource-quantity"),
  resourceUnit: document.querySelector("#resource-unit"),
  resourceDay: document.querySelector("#resource-day"),
  resourceTeamName: document.querySelector("#resource-team-name"),
  resourceSpecification: document.querySelector("#resource-specification"),
  resourceSourceType: document.querySelector("#resource-source-type"),
  resourceSupplier: document.querySelector("#resource-supplier"),
  resourceNotes: document.querySelector("#resource-notes"),
  resourceLoadSelected: document.querySelector("#resource-load-selected"),
  demoTaskButton: document.querySelector("#demo-task-button"),
  demoIssueButton: document.querySelector("#demo-issue-button"),
  demoReportButton: document.querySelector("#demo-report-button"),
  advanceDayButton: document.querySelector("#advance-day-button"),
  clearLogButton: document.querySelector("#clear-log-button"),
  resetStorageButton: document.querySelector("#reset-storage-button"),
  clearDetailButton: document.querySelector("#clear-detail-button"),
};

let adapter = null;
let state = null;
let filters = {
  taskStatus: "all",
  taskWorkArea: "all",
  taskSearch: "",
  issueStatus: "all",
  issueSeverity: "all",
  issueWorkArea: "all",
  issueSearch: "",
  reportDay: "current",
  reportWorkArea: "all",
  reportSearch: "",
  quantityWorkArea: "all",
  quantityStatus: "all",
  quantitySearch: "",
  designQuantityWorkArea: "all",
  designQuantitySearch: "",
  designSpatialWorkArea: "all",
  designSpatialType: "all",
  designSpatialSearch: "",
  terrainType: "all",
  terrainCoordSystem: "all",
  terrainSearch: "",
  resourceWorkArea: "all",
  resourceType: "all",
  resourceSearch: "",
};
let selectedDetail = null;
let spatialDetailCache = {
  workArea: {},
  quantity: {},
};
let historyDetailCache = {
  workArea: {},
  task: {},
  issue: {},
  quantity: {},
};

bootstrap().catch((error) => {
  console.error(error);
  elements.logOutput.textContent = `工地助手初始化失败: ${error.message}`;
});

async function bootstrap() {
  adapter = await window.SiteAssistantApi.createAdapter();
  state = await adapter.loadState();
  bindEvents();
  logAction("Site assistant ready");
  render();
}

function bindEvents() {
  elements.entryForm.addEventListener("submit", handleEntrySubmit);
  elements.entryLoadSelected.addEventListener("click", loadSelectedRecordIntoEntryForm);
  elements.workAreaForm.addEventListener("submit", handleWorkAreaSubmit);
  elements.workAreaLoadSelected.addEventListener("click", loadSelectedWorkAreaIntoForm);
  elements.quantityForm.addEventListener("submit", handleQuantitySubmit);
  elements.quantityLoadSelected.addEventListener("click", loadSelectedQuantityIntoForm);
  elements.designQuantityForm.addEventListener("submit", handleDesignQuantitySubmit);
  elements.designQuantityLoadSelected.addEventListener("click", loadSelectedDesignQuantityIntoForm);
  elements.designSpatialForm.addEventListener("submit", handleDesignSpatialSubmit);
  elements.designSpatialLoadSelected.addEventListener("click", loadSelectedDesignSpatialIntoForm);
  elements.terrainForm.addEventListener("submit", handleTerrainSubmit);
  elements.terrainLoadSelected.addEventListener("click", loadSelectedTerrainIntoForm);
  elements.resourceLogForm.addEventListener("submit", handleResourceLogSubmit);
  elements.resourceLoadSelected.addEventListener("click", loadSelectedResourceLogIntoForm);

  elements.taskList.addEventListener("click", handleTaskListClick);
  elements.issueList.addEventListener("click", handleIssueListClick);
  elements.workAreaList.addEventListener("click", handleWorkAreaClick);
  elements.reportList.addEventListener("click", handleReportClick);
  elements.quantityList.addEventListener("click", handleQuantityClick);
  elements.designQuantityList.addEventListener("click", handleDesignQuantityClick);
  elements.resourceList.addEventListener("click", handleResourceLogClick);
  elements.designSpatialList.addEventListener("click", handleDesignSpatialClick);
  elements.terrainList.addEventListener("click", handleTerrainClick);

  elements.taskFilter.addEventListener("change", () => {
    filters.taskStatus = elements.taskFilter.value;
    renderTasks();
  });
  elements.taskWorkAreaFilter.addEventListener("change", () => {
    filters.taskWorkArea = elements.taskWorkAreaFilter.value;
    renderTasks();
  });
  elements.taskSearch.addEventListener("input", () => {
    filters.taskSearch = elements.taskSearch.value.trim().toLowerCase();
    renderTasks();
  });

  elements.issueFilter.addEventListener("change", () => {
    filters.issueStatus = elements.issueFilter.value;
    renderIssues();
  });
  elements.issueSeverityFilter.addEventListener("change", () => {
    filters.issueSeverity = elements.issueSeverityFilter.value;
    renderIssues();
  });
  elements.issueWorkAreaFilter.addEventListener("change", () => {
    filters.issueWorkArea = elements.issueWorkAreaFilter.value;
    renderIssues();
  });
  elements.issueSearch.addEventListener("input", () => {
    filters.issueSearch = elements.issueSearch.value.trim().toLowerCase();
    renderIssues();
  });

  elements.reportDayFilter.addEventListener("change", () => {
    filters.reportDay = elements.reportDayFilter.value;
    renderReports();
  });
  elements.reportWorkAreaFilter.addEventListener("change", () => {
    filters.reportWorkArea = elements.reportWorkAreaFilter.value;
    renderReports();
  });
  elements.reportSearch.addEventListener("input", () => {
    filters.reportSearch = elements.reportSearch.value.trim().toLowerCase();
    renderReports();
  });
  elements.quantityWorkAreaFilter.addEventListener("change", () => {
    filters.quantityWorkArea = elements.quantityWorkAreaFilter.value;
    renderQuantities();
  });
  elements.quantityStatusFilter.addEventListener("change", () => {
    filters.quantityStatus = elements.quantityStatusFilter.value;
    renderQuantities();
  });
  elements.quantitySearch.addEventListener("input", () => {
    filters.quantitySearch = elements.quantitySearch.value.trim().toLowerCase();
    renderQuantities();
  });
  elements.designQuantityWorkAreaFilter.addEventListener("change", () => {
    filters.designQuantityWorkArea = elements.designQuantityWorkAreaFilter.value;
    renderDesignQuantities();
  });
  elements.designQuantitySearch.addEventListener("input", () => {
    filters.designQuantitySearch = elements.designQuantitySearch.value.trim().toLowerCase();
    renderDesignQuantities();
  });
  elements.designSpatialWorkAreaFilter.addEventListener("change", () => {
    filters.designSpatialWorkArea = elements.designSpatialWorkAreaFilter.value;
    renderDesignSpatialObjects();
  });
  elements.designSpatialTypeFilter.addEventListener("change", () => {
    filters.designSpatialType = elements.designSpatialTypeFilter.value;
    renderDesignSpatialObjects();
  });
  elements.designSpatialSearch.addEventListener("input", () => {
    filters.designSpatialSearch = elements.designSpatialSearch.value.trim().toLowerCase();
    renderDesignSpatialObjects();
  });
  elements.terrainTypeFilter.addEventListener("change", () => {
    filters.terrainType = elements.terrainTypeFilter.value;
    renderTerrainObjects();
  });
  elements.terrainCoordFilter.addEventListener("change", () => {
    filters.terrainCoordSystem = elements.terrainCoordFilter.value;
    renderTerrainObjects();
  });
  elements.terrainSearch.addEventListener("input", () => {
    filters.terrainSearch = elements.terrainSearch.value.trim().toLowerCase();
    renderTerrainObjects();
  });
  elements.resourceWorkAreaFilter.addEventListener("change", () => {
    filters.resourceWorkArea = elements.resourceWorkAreaFilter.value;
    renderResourceLogs();
  });
  elements.resourceTypeFilter.addEventListener("change", () => {
    filters.resourceType = elements.resourceTypeFilter.value;
    renderResourceLogs();
  });
  elements.resourceSearch.addEventListener("input", () => {
    filters.resourceSearch = elements.resourceSearch.value.trim().toLowerCase();
    renderResourceLogs();
  });

  elements.demoTaskButton.addEventListener("click", () => runAction("Create demo task", () => adapter.createDemoTask()));
  elements.demoIssueButton.addEventListener("click", () => runAction("Create demo issue", () => adapter.createDemoIssue()));
  elements.demoReportButton.addEventListener("click", () => runAction("Create demo report", () => adapter.createDemoReport()));
  elements.advanceDayButton.addEventListener("click", () => runAction("Advance one day", () => adapter.advanceDay()));
  elements.clearLogButton.addEventListener("click", clearLog);
  elements.resetStorageButton.addEventListener("click", resetState);
  elements.clearDetailButton.addEventListener("click", clearDetailSelection);
}

async function handleEntrySubmit(event) {
  event.preventDefault();

  const title = elements.entryTitle.value.trim();
  if (!title) {
    logAction("Entry save failed: title is required");
    renderLog();
    return;
  }

  const payload = {
    type: elements.entryType.value,
    title,
    owner: elements.entryOwner.value.trim(),
    workAreaId: elements.entryWorkArea.value,
    notes: elements.entryNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === payload.type) {
    await runAction(
      `Update ${typeLabel(payload.type)} ${selectedDetail.id}`,
      () => updateSelectedEntry(payload),
      selectedDetail,
    );
  } else {
    await runAction(`Create ${typeLabel(payload.type)}`, () => adapter.createEntry(payload));
  }
  elements.entryForm.reset();
  renderWorkAreaOptions();
}

function loadSelectedRecordIntoEntryForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind === "workArea") {
    logAction("Load failed: select a non-work-area record first");
    renderLog();
    return;
  }

  elements.entryType.value = selectedDetail.kind;
  if (selectedDetail.kind === "task") {
    elements.entryTitle.value = record.title;
    elements.entryOwner.value = record.assignee || "";
    elements.entryWorkArea.value = record.workAreaId;
    elements.entryNotes.value = record.notes || "";
    return;
  }

  if (selectedDetail.kind === "issue") {
    elements.entryTitle.value = record.title;
    elements.entryOwner.value = record.owner || "";
    elements.entryWorkArea.value = record.workAreaId;
    elements.entryNotes.value = record.description || "";
    return;
  }

  elements.entryTitle.value = record.completedSummary || "";
  elements.entryOwner.value = record.author || "";
  elements.entryWorkArea.value = record.workAreaIds?.[0] || elements.entryWorkArea.value;
  elements.entryNotes.value = record.nextPlan || "";
}

async function handleWorkAreaSubmit(event) {
  event.preventDefault();

  const name = elements.workAreaName.value.trim();
  if (!name && !(selectedDetail && selectedDetail.kind === "workArea")) {
    logAction("Work area save failed: name is required");
    renderLog();
    return;
  }

  const payload = {
    name,
    type: elements.workAreaType.value,
    workAreaSubtype: elements.workAreaSubtype.value.trim(),
    owner: elements.workAreaOwner.value.trim(),
    plannedProgress: normalizeProgress(elements.workAreaPlanned.value),
    actualProgress: normalizeProgress(elements.workAreaActual.value),
    description: elements.workAreaDescription.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "workArea") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垹绱撴担濮戭亝鎱ㄦ径鎰厸濞达絽鎲￠幉绋款熆鐟欏嫭绀冪紒杞扮矙瀹曘劍绻濋崟顐㈢疄闂備浇顕х换鎺楀磻閻旂厧纾婚柟鍓х帛閸庡秹鏌熸潏鍓х暠闁哄绶氶弻娑㈩敃閻樻彃濮曢梺鎶芥敱閸ㄥ潡骞冭ぐ鎺戠倞闁挎繂鍊告禍楣冩煣韫囷絽浜炲ù婊冪埣濮婄粯鎷呴挊澶婃優闂佸摜鍠庡鈥愁嚕閺屻儲鍋愰柤濮愬€曠粊锕傛⒑閸涘﹤濮﹂柣鎾崇墦閹繝濡烽埡鍌滃幈闂婎偄娲﹂幐鎼佸煕閺冨牊鐓曢柣妯虹－婢у灚顨ラ悙鎻掓殻闁糕晛瀚板畷姗€鍩℃担绋课ら梻鍌欑劍鐎笛呯矙閹寸姭鍋撳鐓庢珝鐎殿喛鍩栫粋鎺斺偓锝庡亐閹峰姊虹粙鎸庢拱闁煎綊绠栭崺鈧い鎺嶇劍閸婃劗鈧娲橀崝娆撳箖濠婂牊鍤嶉柕澶堝劜閻ｉ亶姊绘担鍛婂暈闁规悂顥撶划鍫熺瑹閳ь剙鐣烽悷鎵虫斀闁搞儯鍎扮花濠氭⒑閸濆嫮鈻夐柣鎾崇墦瀹曠敻濡堕崱娆戭啎闂佺懓鐡ㄩ悷銉╂倶閳哄啰纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂備礁鎼崯顐⒚洪妶鍡欘洸鐟滅増甯楅悡鏇熺節闂堟稒绁╂繛鍫熺矋閹便劍绻濋崟顓炵缂備焦顨堥崰鏍х暦閹偊妲诲銈庡亐閺呮繄妲愰幘瀛樺闁告挸寮舵晥闂備礁婀遍…鍫ュ疮閸ф鍋╅柣鎴ｆ鍞梺闈涱煭缁茬厧效濡ゅ懏鈷戦柛锔诲幖閸斿鏌熼幖浣虹暫鐎规洏鍨介弻鍡楊吋閸″繑瀚奸梻鍌氬€搁悧濠冪瑹濡も偓铻ｉ柛顐犲劜閻撴洟鏌ｅΟ铏癸紞濠⒀屽墴閺岋繝宕ㄩ鐘茬厽濡炪們鍨洪惄顖炲箖濞嗘垟鍋撻悽娈跨劸妤犵偞顨婂缁樻媴缁涘缍堥梺绋垮婵炲﹪銆佸棰濇晣闁诲繒绮浠嬬嵁濮椻偓椤㈡瑩鎮剧仦钘夌濠碉紕鍋戦崐鏍ь潖瑜版帒鍑犲┑鐘崇閸も偓闂佺鍕垫畷闁绘挻鐟﹂妵鍕籍閸屾稒鐝梺鐟板暱濞诧附绌辨繝鍥舵晝闁靛繒濮靛▓顓㈡⒑鐎圭姵顥夋い锔诲灥閻忓啴姊洪柅鐐茶嫰婢ф挳鎸婇悢鍛婂弿婵☆垰銇橀崥顐ょ棯閸欍儳鐭欓柡灞剧〒娴狅箓宕滆閸ｎ垰顪冮妶鍡樼叆妞わ妇鏁诲璇测槈濮橈絽浜鹃柨婵嗛娴滄繄鈧娲栭惌鍌炲蓟閿涘嫪娌柛鎾楀嫬鍨辨俊銈囧Х閸嬫稑煤椤撶偟鏆︽俊銈呮噹娴肩娀鏌曟径娑氱暠闁伙箑顭峰濠氬磼濞嗘帒鍘″銈庡幖閻楁捇銆侀弽顓炲耿婵炴垶顭囬澶愭⒑閹肩偛鍔€闁告侗鍠楅鏇㈡煟閻斿摜鐭屽褎顨堥弫顕€鍩￠崨顓熺€梺鍛婂姦閸犳鎮￠妷锔剧瘈闂傚牊绋掗ˉ鐐烘煙閸忕厧濮嶉柡灞剧洴婵″爼宕卞Δ浣界檨婵犳鍠栭敃銊モ枍閿濆绠柣妯款嚙缁犵敻鏌熼悜妯肩畵濠碉繝顥撶槐鎾存媴閸濆嫪澹曞┑鐘灪椤洨鍒掗弮鍫濈妞ゆ柨鍘滈崑鎾绘晝閸屾艾鐎銈嗘礀閹冲繐顕欏ú顏呪拺闂侇偆鍋涢懟顖涙櫠鐎涙﹩娈介柣鎰絻閺嗙偤鏌曢崼顒傜М鐎规洘锕㈤崺鈩冩媴閹绘帊澹曟繝鐢靛У绾板秹鎮￠悩缁樼厵妞ゆ挾鍠庣粭鎺楁煕閺冣偓閼归箖婀佸┑鐘诧工鐎氬嘲鈻撳鍫熺厸鐎光偓閳ь剟宕伴弽顓炵畺闁斥晛鍟崕鐔兼煥濠靛棙顥為柛鐘崇墵濮婃椽鎸婃径濠冩婵炲瓨绮岄悥鐓庮嚕婵犳碍鏅搁柣妯垮皺閿涙粌鈹戞幊閸婃劙宕戦幘瓒佺懓顭ㄩ崼銏㈡毇濠殿喖锕ら…宄扮暦閹烘埈娼╂い鎴ｆ娴滄儳顪冪€ｎ亝鎹ｉ柣顓炴閵嗘帒顫濋敐鍛婵°倗濮烽崑娑⑺囬悽绋挎瀬闁瑰墽绮崑鎰版煠绾板崬澧绘俊鑼厴濮婄粯鎷呮笟顖涙暞闂佽妞挎禍鐐靛垝婵犳艾绠ｉ柣妯兼暩閻掑吋绻濋姀锝呯厫闁告梹鐗犲畷鎰版偨閸涘﹦鍙嗗┑鐘绘涧濡繈顢撳Δ鈧湁婵犲﹤鎳庢禒閬嶆煛瀹€瀣埌闁宠鍨垮畷鍗炩枎韫囨洖骞楅梻鍌欑閹碱偊鎯屾径灞惧床婵犻潧妫涢弳锕傛煕椤愶絾绀€闁绘挻绋戦湁闁挎繂顦伴弫閬嶆煟椤愩垻绠绘慨濠勭帛閹峰懏鎱ㄩ幇銊ヤ壕闁逞屽墴閺屾稓鈧綆鍋呯亸顓㈡婢舵劖鐓熸俊顖滃劋閳绘洟鏌涙惔锛勭缂佽鲸甯￠幃鈺呭礃濞村鐏嗛梻浣告惈閻ジ宕伴弽顓犲祦闁糕剝绋掗崑瀣煕椤愵偄浜濇い銉ヮ槺缁辨挻鎷呴崫鍕闂佺楠哥壕顓犳閻愬绡€闁搞儜鍡樻啺闂備浇娉曢崰鎾存叏閹绢喗鍊峰┑鐘叉处閻撳繐顭跨捄铏瑰闁告柣鍊曢湁闁绘ê鐪伴崑銏℃叏婵犲倹鎯堥弫鍫ユ煕閵夋垟鍋撻柛瀣崌婵¤埖寰勬繝鍕炊闂備礁鎼粙渚€宕㈤悾宀€涓嶉柟鐑橆殕閳锋帒霉閿濆牊顏犻悽顖涚洴閺岀喖宕妷顔惧姼闂傚洤顦甸弻锝夊箣閿濆棭妫勭紓浣哄У濡炰粙寮婚敐鍛傜喖鎳栭埡浣侯偧闂備胶绮幐璇裁洪悢鑲╁祦闁哄稁鐏旀惔顭戞晢闁逞屽墴閹偤鎮滃Ο鑲╊啎闂佸壊鍋嗛崰鎰矆閸垻纾奸弶鍫涘妼缁椦呯磼鏉堛劌绗掗摶锝夋煕韫囨洖甯堕柛銊╀憾閺岋絾鎯旈妶搴㈢秷濠电偛寮堕悧鏇㈡偩閻戠瓔鏁嗛柛鎰典簷缁ㄧ兘姊婚崒娆戭槮闁硅绻濆畷婵嬫晜閻ｅ矈娲搁梺缁樺姇閹碱偄效閹绘崡褰掓偂鎼达絾鎲奸梺鎶芥敱鐢帡婀侀梺鎸庣箓閹峰顭囬悢鍏肩厓鐟滄粓宕楀鈧畷鎴﹀箻缂佹ǚ鎷虹紓浣割儐椤戞瑩宕曢幇鐗堢厵闁告稑锕ラ崐鎰節閳ь剚绗熼埀顒€顫忛搹鍦＜婵☆垰娴氭禍婊嗙亽婵犵數濮村ú銈囧閸ф鐓欓柟娈垮枛椤ｅジ鏌ｉ幘璺烘灈闁哄瞼鍠栭獮鎴﹀箛椤撶姰鈧劙姊洪崫鍕靛剱闁搞劋绲昏ぐ渚€姊洪幖鐐插妧鐎广儱鐗嗛幆鍫熶繆閻愵亜鈧垿宕归搹鍦煓闁硅揪璁ｇ紞鏍ㄧ節闂堟侗鍎涢柡浣告喘閺岋綁寮崹顔叫╂繝銏㈡嚀缁夊墎妲愰幘璇茬＜婵﹩鍏橀崑鎾绘倻閼恒儱娈戦梺鍛婃尫鐠佹煡宕戦幘鎰佹僵妞ゆ帒鍊婚鎺楁倵鐟欏嫭绀冮柨鏇樺灩閻ｅ嘲顭ㄩ崱鈺傂╅梻浣芥〃閻掞箓骞冮崒姘兼綎婵炲樊浜濋崵鎺楁煏閸繃鍟楅柕蹇嬪€栭悡娆戠棯閺夊灝鑸瑰ù婊呭椤ㄣ儵鎮欑€电鈷屽銈冨灪濞茬喖寮崒婊呯＜婵☆垳绮悵鏇炩攽閿涘嫬浜奸柛濠冪墵楠炴劙宕奸弴鐐茬€┑鐐叉▕娴滄繈宕?${selectedDetail.id}`,
      () => adapter.updateWorkArea(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳盯顢氳閸┿儲寰勬繝搴ｅ弳闂佸憡渚楅崹鍗烆熆閹达附鈷掑ù锝呮啞閹牊绻涚仦鍌氬鐎规洘鍨甸埥澶娾枎閹搭厽绁繝娈垮枟閵囨盯宕戦幘瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐礋椤掆偓閸炲姊洪崫鍕効缂佺粯绻堝畷娲焵椤掍降浜滈柟鐑樺灥椤忣亪鏌ｉ幒鏇炰汗闁逞屽墮缁犲秹宕曢柆宥呯疅婵せ鍋撻柡浣稿暣瀹曟帒鈽夊顒€绠為梻鍌欑閹碱偄煤閵忋倕绀夌€光偓閸曨剙鈧爼鏌ｅΟ鍏兼毄缁炬儳銈搁弻锝呂熼崫鍕瘣闂佸磭绮ú鐔煎蓟閿涘嫪娌柛鎾楀嫬鍨遍梻浣虹《閺呮稓鈧碍婢橀悾宄邦潨閳ь剟寮崒鐐茬閹肩补鈧剚鈧繐鈹戦悩鍨毄濠殿喕鍗冲畷瑙勭附闂堚晝绋忔繝銏ｆ硾閳洖煤椤忓嫬鍞ㄥ銈嗘尵閸嬬喖宕㈤幘顔解拺缁绢厼鎳忚ぐ褔姊婚崟顐㈩伃鐎规洘鍨块獮鍥敇濠娾偓缁ㄥ姊虹憴鍕凡濠⒀冮叄瀹曟岸鎮ч崼娑楃盎闁硅壈鎻槐鏇犵不婵犳碍鐓涚€光偓鐎ｎ剛袣缂備胶濮甸惄顖氼嚕閹绢喗鍊烽柣妤€鐗嗛悡鏇㈡⒒閸屾瑧顦﹂柟纰卞亰楠炲繒鈧綆鍠栫壕濠氭煕濞戝崬鐏ｉ柣顓烆樀閺岀喖鎮滃鍡樼暥缂備胶濮烽幊鎾绘箒闂佹寧绻傞幊搴ｆ暜閵娾晜鐓欓梺鍨儐閵囨繃鎱ㄦ繝鍐┿仢鐎规洏鍔嶇换婵嬪礋椤撶姵娈奸梻浣筋嚙鐎涒晠宕欒ぐ鎺戝偍濠靛倸鎲￠弲婵嬫煏韫囧ň鍋撻幇浣告闂佽瀛╃粙鎺椻€﹂崶顒€鍌ㄥù鐘差儐閳锋垿鏌涢幇顒€绾ч柟顖氱墦閺屻劑寮村Ο琛″亾濠靛绠栨慨妞诲亾闁轰礁鍊荤划鐢碘偓锝庡亽閸熷秹姊绘担铏瑰笡闁告梹鐗為妵鎰板礃椤斿吋杈堥梺鎸庣箓閹冲寮ㄩ懞銉ｄ簻闁哄啫鍊归崵鈧繛瀛樼矒缁犳牕顫忕紒妯肩懝闁逞屽墮椤洩顦归柟顔ㄥ洤骞㈡俊鐐灪缁嬫垿鍩ユ径鎰潊闁绘鏁搁崢顒勬⒒娴ｈ櫣銆婇柛鎾寸箘缁瑩骞掑Δ浣镐簵闂佺粯姊婚崢褏绮昏ぐ鎺撶厵缁炬澘宕獮鏍煟韫囥儳鎮肩紒杈ㄥ笚瀵板嫰骞囬鐔兼暘闂傚倸娲らˇ鎵崲濠靛洨绡€闁稿本鍑规导鈧紓鍌欒兌婵兘宕戦妶澶婅摕闁绘梻鈷堥弫濠囨煙椤栧棗鍊搁ˉ姘辩磽閸屾瑨鍏岀紒顕呭灣閹广垽宕掗悜鍥╃◤濠电娀娼ч鎰板极閸ャ劎绠鹃柟瀵稿仧閹冲啯銇勮箛鏇炲妺缂佺粯绻堥幃浠嬫濞戞鎽嬮梻浣筋潐濡炴寧绂嶉悙宸殫濠电姴鍟伴々鐑芥倵閿濆簼绨介柣銈呮嚇濮婅櫣鎹勯妸銉︾亖婵犳鍠栭顓犲垝鐠囧樊娼╅柤鍝ユ暩閸樺崬顪冮妶鍡楀濠殿喗鎸冲畷婵嗩煥閸喓鍘介梺瑙勫劤椤曨厼煤閹绢喗鐓涢悘鐐插⒔濞插瓨銇勯姀鈩冪妞ゃ垺娲熼敐鐐侯敇閻樺灚鏅ㄥ┑鐘垫暩婵參骞忛崘顏冩勃闁兼亽鍎宠ぐ搴ㄦ⒒娴ｇ瓔鍤冮柛锝庡灣閹广垹鈹戦崶锔剧畾闂佸壊鍋呭ú鏍嵁閵忋倖鐓涢柛銉㈡櫅鍟搁梺浼欑悼閸嬫挻绌辨繝鍥ㄥ€锋い蹇撳閸嬫捇寮介鐔蜂罕濠德板€曢幊蹇涘磻閿熺姵鐓忓┑鐐靛亾濞呮捇鏌℃担鍛婎棦闁哄矉缍佸顒勫垂椤旇棄鈧垶姊虹紒妯诲鞍婵炶尙鍠栧濠氬即閵忕娀鍞跺┑鐘绘涧濞村嫮妲愰悙娴嬫斀闁绘劘灏欐晶娑氱磼椤旇姤宕岀€殿喖顭烽弫宥夊礋椤忓懎濯伴梻浣告啞閹稿棝宕熼銏画闂備浇顕х€涒晠顢欓弽顓炵獥婵°倕鎳庣粻浼存煣韫囷絽浜楃紒璇叉閺岀喖姊荤€靛壊妲柛鐑嗗灦閹嘲顭ㄩ崘顏嗗姱閻庤娲﹂崑鍕亙闂佸憡渚楅崰鎺楀箯婵犳碍鈷戠紒瀣濠€浼存煟閻旀繂娉氶崶顒佹櫆闂佹鍨版禍楣冩偡濞嗗繐顏璺哄閺屾盯骞樼€靛憡鍣梺鍛婄懃閹虫ê顫忓ú顏勭閹肩补鎳囬幏濠氭⒑缁嬫鍎愰柟鍛婃倐閹箖鎮滈挊澶岀厬婵犮垼娉涢惉濂告儊閸儲鈷掗柛灞炬皑婢ф稑銆掑顓ф疁鐎规洘娲熼獮鍥敇濠娾偓缁ㄥ姊洪棃娑辨Ф闁稿氦娅曢弲璺衡槈濮樿京锛滅紓鍌欑劍椤洤煤鐎涙﹩娈介柣鎰▕閸庢棃鏌熼鐣屾噰鐎规洖宕灒闁惧繘鈧稒妯婇梻鍌欑绾绢厾鍒掗鐐茬闁搞儺鍏欓埀顑跨椤粓鍩€椤掑嫬绠栭柕蹇嬪€栭幆鐐烘偣閸ワ絺鍋撻搹顐ｇ彫闂傚倸鍊峰ù鍥敋瑜忛埀顒佺▓閺呮繄鍒掑▎鎾崇婵＄偟鍎甸崑鎾绘晝閸屾氨鍊炲銈嗗笂缁€渚€宕滆ぐ鎺撳€甸柛蹇擃槸娴滈箖姊洪崨濠冨闁告挻鐩畷銏ゆ焼瀹ュ棛鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋崳钘壝瑰鍕€愭鐐茬Ч椤㈡瑩宕滆缁辨煡鏌ｆ惔鈥冲辅闁稿鎹囬弻娑㈠箛闂堟稒鐏堥梺鍦櫕閺佸摜妲愰幘瀛樺闁惧繒鎳撶粭锛勭磽娴ｇ瓔鍤欓柣妤€妫濋幃楣冩倻閽樺鍞堕梺鍝勬处閵囨盯宕戦幘璇插唨妞ゆ挆鍕珗婵＄偑鍊栧濠氬磻閹惧绠鹃悹鍥囧懐鏆ら梺璇″櫙缁绘繂顕ｉ幘顔藉亜闁惧繗顕栭崯搴ㄦ⒒娴ｇ儤鍤€闁宦板妿閹广垽宕掗悙鏉戞疂闁荤喐鐟ョ€氬嘲鈻撴禒瀣厽闁归偊鍘介崕妤佺箾閸喐绀堢紒杈ㄥ笧缁辨帒螣閸忕厧鍨遍柣搴ゎ潐濞叉粓宕㈣閸╃偤骞嬮敃鈧柋鍥ㄧ節闂堟稓澧曟鐐搭殔閳规垿鎮╅幇浣告櫛闂佸摜濮甸悧鐘诲极閸愵喖围濠㈣泛锕﹂鎰渻閵堝棗濮傞柛濠冩礀椤曪綁寮婚妷锔规嫼闂佺厧顫曢崐鏇炵摥婵犵數鍋犻婊呯不閹烘桅闁圭増婢樼粈鍐┿亜韫囨挻顥欑紒妤€顦埞鎴︽倷閸欏鏋欐繛瀛樼矋缁诲牓宕哄☉銏犵闁挎梻鏅崢鐐節濞堝灝鏋熼柛鏃€娲熼崺鈧い鎺嶇劍缁€瀣偓娈垮枟閹倸鐣烽幒妤佸€烽悗鐢殿焾楠炲牓姊虹涵鍛棈闁规椿浜炲濠冦偅閸愩劍杈堝銈嗗笒閸婄敻宕戦幘鑸靛枂闁告洦鍓涢ˇ銊モ攽閿涘嫬浠掔紒顔界懇閻涱噣宕橀妸銏＄€婚梺瑙勫劤閸樻牜妲愰崼鏇熲拺闁告稑锕ユ径鍕煕濞嗗繘鍙勭€规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛閸曨偆姣㈤梺鐟板级閹倿骞冭瀹曠厧鈹戦崼銏″殐闂傚倷鐒︽繛濠囧绩闁秴鍨傞柛褎顨呴拑鐔哥箾閹寸們姘ｉ崼鐔稿弿婵°倐鍋撻柣妤€妫欓幈銊モ槈閵忊檧鎷洪梺鑽ゅ枑濠㈡﹢寮抽柆宥嗙厱闁绘洑绀侀悘锕€鈹戦敍鍕毈鐎规洜鍠栭、娑樷槈濞嗘劗褰嗛梻浣藉吹婵潙煤閳哄啩鐒婃繛鍡樺姉椤╃兘鏌熼梻瀵稿妽闁绘挶鍨烘穱濠囶敍濠靛棗鎯炵紓浣哄Х閸嬨倝寮婚敍鍕勃闁伙絽鐫楄閳ь剝顫夊ú锕傚磻婵犲倻鏆﹂柣鏃傗拡閺佸棝鏌嶈閸撴瑩鍩㈠澶娢у璺侯儌閹?${payload.name}`, () => adapter.createWorkArea(payload));
  }

  elements.workAreaForm.reset();
  elements.workAreaType.value = "road";
  elements.workAreaSubtype.value = "";
  elements.workAreaPlanned.value = "0";
  elements.workAreaActual.value = "0";
}

async function handleQuantitySubmit(event) {
  event.preventDefault();
  const itemName = elements.quantityItemName.value.trim();
  if (!itemName) {
    logAction("Quantity save failed: item name is required");
    renderLog();
    return;
  }

  const payload = {
    workAreaId: elements.quantityWorkArea.value,
    itemName,
    itemCode: elements.quantityItemCode.value.trim(),
    category: elements.quantityCategory.value.trim() || "general",
    unit: elements.quantityUnit.value.trim() || "m3",
    plannedQuantity: Number(elements.quantityPlanned.value || 0),
    actualQuantity: Number(elements.quantityActual.value || 0),
    notes: elements.quantityNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "quantity") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垹绱撴担濮戭亝鎱ㄦ径鎰厸濞达絽鎲￠幉绋款熆鐟欏嫭绀冪紒杞扮矙瀹曘劍绻濋崟顐㈢疄闂備浇顕х换鎺楀磻閻旂厧纾婚柟鍓х帛閸庡秹鏌熸潏鍓х暠闁哄绶氶弻娑㈩敃閻樻彃濮曢梺鎶芥敱閸ㄥ潡骞冭ぐ鎺戠倞闁挎繂鍊告禍楣冩煣韫囷絽浜炲ù婊冪埣濮婄粯鎷呴挊澶婃優闂佸摜鍠庡鈥愁嚕閺屻儲鍋愰柤濮愬€曠粊锕傛⒑閸涘﹤濮﹂柣鎾崇墦閹繝濡烽埡鍌滃幈闂婎偄娲﹂幐鎼佸煕閺冨牊鐓曢柣妯虹－婢у灚顨ラ悙鎻掓殻闁糕晛瀚板畷姗€鍩℃担绋课ら梻鍌欑劍鐎笛呯矙閹寸姭鍋撳鐓庢珝鐎殿喛鍩栫粋鎺斺偓锝庡亐閹峰姊虹粙鎸庢拱闁煎綊绠栭崺鈧い鎺嶇劍閸婃劗鈧娲橀崝娆撳箖濠婂牊鍤嶉柕澶堝劜閻ｉ亶姊绘担鍛婂暈闁规悂顥撶划鍫熺瑹閳ь剙鐣烽悷鎵虫斀闁搞儯鍎扮花濠氭⒑閸濆嫮鈻夐柣鎾崇墦瀹曠敻濡堕崱娆戭啎闂佺懓鐡ㄩ悷銉╂倶閳哄啰纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂備礁鎼崯顐⒚洪妶鍡欘洸鐟滅増甯楅悡鏇熺節闂堟稒绁╂繛鍫熺矋閹便劍绻濋崟顓炵缂備焦顨堥崰鏍х暦閹偊妲诲銈庡亐閺呮繄妲愰幘瀛樺闁告挸寮舵晥闂備礁婀遍…鍫ュ疮閸ф鍋╅柣鎴ｆ鍞梺闈涱煭缁茬厧效濡ゅ懏鈷戦柛锔诲幖閸斿鏌熼幖浣虹暫鐎规洏鍨介弻鍡楊吋閸″繑瀚奸梻鍌氬€搁悧濠冪瑹濡も偓铻ｉ柛顐犲劜閻撴洟鏌ｅΟ铏癸紞濠⒀屽墴閺岋繝宕ㄩ鐘茬厽濡炪們鍨洪惄顖炲箖濞嗘垟鍋撻悽娈跨劸妤犵偞顨婂缁樻媴缁涘缍堥梺绋垮婵炲﹪銆佸棰濇晣闁诲繒绮浠嬬嵁濮椻偓椤㈡瑩鎮剧仦钘夌濠碉紕鍋戦崐鏍ь潖瑜版帒鍑犲┑鐘崇閸も偓闂佺鍕垫畷闁绘挻鐟﹂妵鍕籍閸屾稒鐝梺鐟板暱濞诧附绌辨繝鍥舵晝闁靛繒濮靛▓顓㈡⒑鐎圭姵顥夋い锔诲灥閻忓啴姊洪柅鐐茶嫰婢ф挳鎸婇悢鍛婂弿婵☆垰銇橀崥顐ょ棯閸欍儳鐭欓柡灞剧〒娴狅箓宕滆閸ｎ垰顪冮妶鍡樼叆妞わ妇鏁诲璇测槈濮橈絽浜鹃柨婵嗛娴滄繄鈧娲栭惌鍌炲蓟閿涘嫪娌柛鎾楀嫬鍨辨俊銈囧Х閸嬫稑煤椤撶偟鏆︽俊銈呮噹娴肩娀鏌曟径娑㈡婵炲拑濡囩槐鎾诲磼濞嗘帒鍘￠梺绋款儐閹瑰洤鐣烽弴銏犵闁芥ê锛夎閺岀喖姊荤€靛壊妲梺钘夊暟閸犳牠寮婚妸鈺傚亜闁告繂瀚呴姀銏㈢＜闁逞屽墴瀹曟﹢顢欓悾灞藉妇濠电姷鏁搁崑娑㈡倶濠靛绀夋俊銈呮噺閻撴洟鎮楅敐搴′簼鐎规洖鏈〃銉╂倷鐎电顫ч梺鐟板槻閹虫劗鍒掑▎鎾冲瀭妞ゆ梻鐡旈崥鍥ㄧ節閻㈤潧啸闁轰焦鎮傚畷鎴︽倷閸濆嫬鐎梺鍓插亝濞叉﹢宕戦敓鐘崇叆婵犻潧妫欓ˉ鐘炽亜閳轰礁绾х紒缁樼箖缁绘繈宕掑鍐炬澑闂備胶绮幐鍝ユ崲濮椻偓閹繝顢曢敃鈧悙濠囨煏婢跺牆鍔氬┑顔哄灮缁辨帡鎮欓鈧崝銈嗙箾绾绡€鐎殿喛顕ч鍏煎緞鐎ｎ亞妾┑鐘灱閸╂牞鎽梺瀹狀嚙閻楁挸顫忛搹瑙勫厹闁告侗鍣Λ鍕⒑缂佹澧遍柛妯犲浂鏁嬮柨婵嗘椤╃兘鎮楅敐鍛粵闁哄拑缍佸铏圭磼濡崵鍙嗛梺鍦拡閸嬪棝寮鍢夋棃宕ㄩ鎯у箺闂備胶绮弻銊╁箺濠婂牊鍎楅悗锝庡墰绾惧吋銇勯弮鍥撻悘蹇ｅ弮閺岋綁鏁愰崨顓熜╁銈庡幑閸旀垵鐣峰鈧幃娆擃敆閳ь剟宕楁繝鍥ㄢ拺闁告繂瀚峰Σ鎼佹煟濡も偓閸熸潙顕ｉ幓鎺嗘斀閻庯綆鍋勯埀顒€娼￠弻娑滎槼妞ゃ劌妫濆畷鎰板垂椤愵偅顔旈梺缁樺姌鐏忔瑦绂掗姀銈嗙厱闁哄啠鍋撶痪鏉跨У缁岃鲸绻濋崶鑸垫櫇闂侀潧绻堥崐鏇烆嚕娴煎瓨鍊甸悷娆忓缁€鍐煕閵娿儳浠㈤柣锝囧厴婵℃瓕顦柛瀣尭閳藉鈻庡Ο鐓庡Ш闂備礁鎲￠敃銏＄鐠轰警娼栭柧蹇氼潐閸忔粓鏌涘☉鍗炲箻闁告梻鍏樺娲川婵犲啰鍙嗙紓浣割槺閹虫捇顢氶敐澶婄畾闁煎壊鍏涘Ч妤呮⒑閸︻厼鍔嬮柟鎼佺畺瀹曘垽鎮介崨濞炬嫽婵炶揪绲介幗婊勭閵徛颁簻闁瑰瓨绻冮ˉ銏犫攽閿熺姵娑ч柍瑙勫灴瀹曞爼濡搁妷銉ょ礋婵犵數濮烽弫鍛婃叏閹绢喖鐤い鏍仜妗呭┑鐘绘涧閻楀啴宕戦幘鑸靛枂闁告洦鍓涢敍姗€姊洪崨濠冪叆缂佸鐖奸獮鎴﹀閻橆偅鏂€闁诲函缍嗘禍鐐核囬弶娆炬富闁靛牆妫欑亸闈涒攽椤曗偓濞佳囧煝閹惧闄勯柛娑樑堥幏缁樼箾鏉堝墽鎮奸柣鈩冩瀹曢潧鈻庨幘鏉戔偓鍨箾閹寸偛绗氭繛鍛功閳ь剝顫夊ú姗€鎮烽妸鈺佄﹂柟鐗堟緲缁犳娊鏌熺€涙绠橀柍褜鍓﹂崣鍐潖濞差亜绀堥柟缁樺笂缁ㄧ厧鈹戦悙鎻掔骇闁挎洏鍨归锝夊蓟閵夈儴鎽曢梺闈涱檧婵″洭宕㈡禒瀣拺鐟滅増甯掓禍浼存煕閻樺磭澧电€规洘绻勯埀顒婄秵閸犳鎮″☉銏＄厱婵炴垵宕弸銈囩磼閻橀潧浠遍柡宀嬬磿娴狅箓宕滆閳ь剚甯掗湁闁绘瑥鎳愰悾鐢碘偓瑙勬礃缁繘藝娴煎瓨鐓冪憸婊堝礈濮樿鲸鏆滈柨鐔哄Т閽冪喐绻涢幋鐑嗙劯闁绘梻鍘ч柨銈嗕繆閵堝倸浜鹃梺鍦櫕閺佸摜妲愰幘瀛樺闁惧繒鎳撶粭锛勭磽娴ｇ瓔鍤欓柣妤佹崌閻涱噣宕橀埡鍐炬祫闁诲函缍嗛崑鎺懳涢崘銊㈡斀闁绘劖顔栧Λ搴ｇ磽閸粌宓嗙€规洝顫夌粋鎺斺偓锝庝海閹芥洖鈹戦悙鏉戠仧闁搞劍妞藉畷鎴﹀礋椤撶姷锛滈柣搴秵閸嬫帡宕曢妷锔跨箚妞ゆ劑鍨洪ˉ鐘电磼鏉堛劍灏扮紒妤冨枛瀹曟儼顦抽柣蹇撶墕椤啴濡舵惔鈥崇闂佺绻戦敃銏ゅ箖娴兼惌鏁婇柛銏狀槺閸犳牕鐣烽妸鈺傤棃婵炴垯鍨瑰鏉款渻閵堝啫鐏柣妤佺矒楠炴垿宕熼姣尖晝鎲告惔銊ョ柧?${selectedDetail.id}`,
      () => adapter.updateQuantity(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳盯顢氳閸┿儲寰勬繝搴ｅ弳闂佸憡渚楅崹鍗烆熆閹达附鈷掑ù锝呮啞閹牊绻涚仦鍌氬鐎规洘鍨甸埥澶娾枎閹搭厽绁繝娈垮枟閵囨盯宕戦幘瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐礋椤掆偓閸炲姊洪崫鍕効缂佺粯绻堝畷娲焵椤掍降浜滈柟鐑樺灥椤忣亪鏌ｉ幒鏇炰汗闁逞屽墮缁犲秹宕曢柆宥呯疅婵せ鍋撻柡浣稿暣瀹曟帒鈽夊顒€绠為梻鍌欑閹碱偄煤閵忋倕绀夌€光偓閸曨剙鈧爼鏌ｅΟ鍏兼毄缁炬儳銈搁弻锝呂熼崫鍕瘣闂佸磭绮ú鐔煎蓟閿涘嫪娌柛鎾楀嫬鍨遍梻浣虹《閺呮稓鈧碍婢橀悾宄邦潨閳ь剟寮崒鐐茬閹肩补鈧剚鈧繐鈹戦悩鍨毄濠殿喕鍗冲畷瑙勭附闂堚晝绋忔繝銏ｆ硾閳洖煤椤忓嫬鍞ㄥ銈嗘尵閸嬬喖宕㈤幘顔解拺缁绢厼鎳忚ぐ褔姊婚崟顐㈩伃鐎规洘鍨块獮鍥敇濠娾偓缁ㄥ姊虹憴鍕凡濠⒀冮叄瀹曟岸鎮ч崼娑楃盎闁硅壈鎻槐鏇犵不婵犳碍鐓涚€光偓鐎ｎ剛袣缂備胶濮甸惄顖氼嚕閹绢喗鍊烽柣妤€鐗嗛悡鏇㈡⒒閸屾瑧顦﹂柟纰卞亰楠炲繒鈧綆鍠栫壕濠氭煕濞戝崬鐏ｉ柣顓烆樀閺岀喖鎮滃鍡樼暥缂備胶濮烽幊鎾绘箒闂佹寧绻傞幊搴ｆ暜閵娾晜鐓欓梺鍨儐閵囨繃鎱ㄦ繝鍐┿仢鐎规洏鍔嶇换婵嬪礋椤撶姵娈奸梻浣筋嚙鐎涒晠宕欒ぐ鎺戝偍濠靛倸鎲￠弲婵嬫煏韫囧ň鍋撻幇浣告闂佽瀛╃粙鎺椻€﹂崶顒€鍌ㄥù鐘差儐閳锋垿鏌涢幇顒€绾ч柟顖氱墦閺屻劑寮村Ο琛″亾濠靛绠栨慨妞诲亾闁轰礁鍊荤划鐢碘偓锝庡亽閸熷秹姊绘担铏瑰笡闁告梹鐗為妵鎰板礃椤斿吋杈堥梺鎸庣箓閹冲寮ㄩ懞銉ｄ簻闁哄啫鍊归崵鈧繛瀛樼矒缁犳牕顫忕紒妯肩懝闁逞屽墮椤洩顦归柟顔ㄥ洤骞㈡俊鐐灪缁嬫垿鍩ユ径鎰潊闁绘鏁搁崢顒勬⒒娴ｈ櫣銆婇柛鎾寸箘缁瑩骞掑Δ浣镐簵闂佺粯姊婚崢褏绮昏ぐ鎺撶厵缁炬澘宕獮鏍煟韫囥儳鎮肩紒杈ㄥ笚瀵板嫰骞囬鐔兼暘闂傚倸娲らˇ鎵崲濠靛洨绡€闁稿本鍑规导鈧紓鍌欒兌婵兘宕戦妶澶婅摕闁绘梻鈷堥弫濠囨煙椤栧棗鍊搁ˉ姘辩磽閸屾瑨鍏岀紒顕呭灣閹广垽宕掗悜鍥╃◤濠电娀娼ч鎰板极閸ャ劎绠鹃柟瀵稿仧閹冲啯銇勮箛鏇炲妺缂佺粯绻堥幃浠嬫濞戞鎽嬮梻浣筋潐濡炴寧绂嶉悙宸殫濠电姴鍟伴々鐑芥倵閿濆簼绨介柣銈呮嚇濮婅櫣鎹勯妸銉︾亖婵犳鍠栭顓犲垝鐠囧樊娼╅柤鍝ユ暩閸樺崬顪冮妶鍡楀濠殿喗鎸冲畷婵嗩煥閸喓鍘介梺瑙勫劤椤曨厼煤閹绢喗鐓涢悘鐐插⒔濞插瓨銇勯姀鈩冪妞ゃ垺娲熼敐鐐侯敇閻樺灚鏅ㄥ┑鐘垫暩婵參骞忛崘顏冩勃闁兼亽鍎宠ぐ搴ㄦ⒒娴ｇ瓔鍤冮柛锝庡灣閹广垹鈹戦崶锔剧畾闂佸壊鍋呭ú鏍嵁閵忋倖鐓涢柛銉㈡櫅鍟搁梺浼欑悼閸嬫挻绌辨繝鍥ㄥ€锋い蹇撳閸嬫捇寮介鐔蜂罕濠德板€曢崯顖氱暦閺屻儲鐓曢悘鐐插⒔閵嗘帗銇勯埡鍕毢闁瑰弶鎮傞幃褔宕煎┑鍫㈡嚃闂備胶绮幐璇裁哄Ο鑽も攳濠电姴娲ゅ洿闂佸憡娲﹂崣搴∥ｉ鈧娲川婵犲嫮鐣哄┑锛勫仒缁瑥顕ｆ繝姘伋鐎规洖娲﹀▓鏇㈡煟鎼搭垳绉甸柛鎾寸閳敻姊虹拠鎻掝劉妞ゆ梹鐗犲畷鎶筋敋閳ь剙鐣烽幎鑺ユ櫜闁告侗鍨卞▓楣冩⒑閸︻厼鍔嬮柛銈忕畵瀵噣鍩€椤掑嫬绠柛娑欐綑娴肩娀鏌曟径鍫濆姦婵″墽鍏樺濠氬磼濮橆兘鍋撻幖浣哥９鐎瑰嫭鍣磋ぐ鎺戠倞鐟滄粌霉閺嶎厽鐓忓┑鐐戝啯鍣介柣鎺戝悑缁绘稒娼忛崜褏袣濠电偛鎷戠紞渚€骞嗗畝鍕缂備焦顭囬崢鍗烆渻閵堝骸骞楅柛銊ョ仛缁傚秹鎮欓悜妯煎帗闂佽崵鍠愭竟鍡楃摥闂備礁鐤囬～澶愬垂閸ф绠栭柍鍝勬噹閻顭跨捄渚剱闁稿﹦鍏樺娲箹閻愭彃濮曢梺鍦焾閸熷潡锝炶箛娑欐優闁革富鍘鹃悡鎾绘⒑閸︻収鐒鹃悗娑掓櫊楠炲繘鏌嗗鍡忔嫼濠电偠灏褍顕ｆィ鍐╃厱闁绘ɑ鍓氬▓妯肩磼椤旇娅婇柟顔哄灲閹剝鎯旈垾宕囥偖闂傚倷鑳剁划顖炲礉韫囨稑鐤炬繝濠傜墕濡﹢鏌嶈閸撶喎顫忕紒妯诲闁惧繒鎳撶粭锟犳⒑閸涘﹥鈷愭い顓炴处缁傚秶绮欐惔鎾寸€婚梺瑙勫劤绾绢參顢欓幋锔解拺缂備焦锕╅悞浠嬫煛娴ｅ憡鎲稿瑙勬礋瀹曟绮潪鎵泿闂備礁鎼崯顐⒚洪妶鍫毐闂備浇顕х换鎰崲閹烘鏋侀柛婵勫劜椤洟鏌熼悜姗嗘闁轰礁锕﹂惀顏堝箯鐏炵厧鎯堥梺鍛婅壘椤戝骞冨Δ鈧埢鎾诲垂椤旂晫浜梻渚€鈧偛鑻晶浼存煕閿濆啫鍔氭い顒€锕俊鎼佸Ψ閵忊剝鏉搁梻浣虹帛閸旀牞銇愰崘顔肩畺闁硅揪闄勯悡鐔镐繆閵堝嫮璐版繛鍫燂耿閺岀喖鐛崹顔句患闂佸疇妫勯ˇ顖烇綖濠婂牆骞㈡俊銈勭劍閻濇艾鈹戦敍鍕杭闁稿﹥鐗曡灋濞达絽鎽滈弳锕傛煟閵忕姵鍟為柛搴￠叄楠炴牕菐椤掆偓閻忣喚绱掗悩鎻掆挃闁汇儺浜獮鍡氼檨闁稿骸绻愰湁婵犲﹤鎳忛崵鈧梺瀹狀潐閸ㄥ潡骞冨▎鎾崇厸濞达絽鍢查ˉ姘舵⒒閸屾艾鈧绮堟笟鈧獮鏍敃閿曗偓鐎氬銇勯幒鎴濐仾闁稿骸瀛╅妵鍕冀閵娿儱姣堥梺鎼炲€栧ú鐔煎蓟閻旇櫣纾奸柕蹇曞У閻忓牓鏌熼婊冩灈婵﹥妞藉Λ鍐ㄢ槈鏉堫煈鈧棙绻濈喊妯峰亾閾忣偆鈹涢梺闈涙处閸旀瑩銆佸☉妯锋婵浜Σ鍥⒒娴ｅ湱婀介柛銊ㄦ椤洩顦崇紒鍌涘笩椤﹀綊鏌＄仦鍓р槈閾伙綁鏌ｅΟ鍝勭骇濠㈣泛瀚伴弻娑氣偓锝庝憾濡偓闂佸搫鐭夌紞渚€鐛鈧畷姗€鎳犻浣囩偞绻濋悽闈涗粶闁告艾顑夐幃褔鎮╃拠鑼舵憰閻熸粍鍨圭划璇测槈閵忕姷顔掔紒鐐劤椤戝洭銆侀崨瀛樷拻濞达綀顫夐妵鐔兼煕濡湱鐭欓柟顔惧厴閸╋繝宕ㄩ鈩冩啺婵犵數鍋為崹顖炲垂瑜版帒绀冮柍褜鍓熷娲濞戞艾顣洪梺鐟板暱闁帮綁宕哄☉娆忕窞闁归偊鍘搁幏娲煛婢跺苯浠﹀鐟版钘濋柨鏇楀亾妞ゎ叀鍎婚ˇ鎾煛閸滀礁浜滈崡閬嶆煙閻楀牊绶茬紒鐘差煼閹鈽夊▍顓т邯椤㈡捇骞橀崜浣猴紳婵炶揪绲藉﹢閬嶅煡婢跺浜滈柟瀛樼箖閸ｅ綊鏌嶇紒妯诲磳妞ゃ垺锕㈡慨鈧柍閿亾闁圭柉娅ｇ槐鎾存媴閸撴彃鍓伴柣蹇撶箰閹冲酣顢欒箛娑樜ㄩ柨鏂垮⒔椤旀洜绱掔紒銏犲籍妞ゃ儲鎸惧褔鍩€椤掑嫭鍊?${payload.itemName}`, () => adapter.createQuantity(payload));
  }

  resetQuantityForm();
}

async function handleDesignQuantitySubmit(event) {
  event.preventDefault();
  const itemName = elements.designQuantityItemName.value.trim();
  if (!itemName) {
    logAction("Design quantity save failed: item name is required");
    renderLog();
    return;
  }

  const payload = {
    workAreaId: elements.designQuantityWorkArea.value,
    itemName,
    itemCode: elements.designQuantityItemCode.value.trim(),
    category: elements.designQuantityCategory.value.trim() || "general",
    unit: elements.designQuantityUnit.value.trim() || "m3",
    targetQuantity: Number(elements.designQuantityTarget.value || 0),
    designVersion: elements.designQuantityVersion.value.trim(),
    notes: elements.designQuantityNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "designQuantity") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垿鏌熺粙鎸庢崳缂佺姵鎸绘穱濠囶敃閵忕媭鍔夌紓浣稿€哥粔鎾€﹂妸鈺侀唶闁绘柨鎼敮楣冩⒒婵犲骸浜滄繛灞傚€濋弫鍐Χ閸℃ɑ鐝烽梺鍛婄懃椤︻厽绂嶅鍫熺厪濠㈣泛鐗嗛崝銈咁熆瑜庨惄顖炲蓟閺囥垹鐐婄憸宥夘敂椤撶偐鏀芥い鏃傛嚀娴滈箖姊绘担瑙勭伇闁哄懏鐩畷鏉款潩椤戔晜鐩畷姗€顢欓挊澶嗗亾閻㈠憡鍋℃繛鍡楃箰椤忣亞绱掗埀顒勫醇閵夛妇鍘遍梺缁樏壕顓熸櫠椤掆偓鑿愰柛銉戝秷鍚Δ鐘靛仦閻楁骞忛崨顖涘枂闁告洦鍓涜ぐ鍡涙⒒閸屾瑧顦﹂柛姘儐缁傚秵绂掔€ｎ亞锛熼梺鑲┾拡閸撴岸顢曢懞銉ｄ簻闁规澘澧庨幃鑲╃磼閳锯偓閸嬫挾绱撴担鍝勪壕婵犮垺锕㈣棟閺夊牃鏅涢ˉ姘舵煕瑜庨〃鍡涙偂閺囥垺鍊甸柨婵嗛娴滄粓鏌ｈ箛鎿冨殶闁逞屽墲椤煤濮椻偓瀹曟繂鈻庤箛锝呮婵炲濮撮鎰板极閸ヮ剚鐓熼柡鍐ㄦ处閼靛湱绱撻崘鈺傜缂佺粯绻傞銉╂煥鐎ｎ偆鍑￠梺閫炲苯澧繛鑼枛閻涱喗绻濋崘鈺佸妳闂侀潧绻掓刊顓㈠吹閵堝鈷戠紓浣癸供閻掔偓銇勯弴鍡楁噽娑撳秹鎮峰▎蹇擃伀缂佺娀绠栭弻銊モ攽閸℃侗鈧顭胯閸犳牠鍩為幋锔筋€愰梺绋款儐閸旀瑩骞嗛埀顒併亜韫囨挾澧曠紒鐘虫皑閹茬顭ㄩ崼鐔蜂簵婵犻潧鍊搁幉锟犳偂濞戙垺鍊堕柣鎰版涧娴滃墽绱掗埀顒佸緞瀹€鈧壕濂告煟濡櫣锛嶉柕鍡樺浮閺屽秷顧侀柛鎾卞妿缁辩偤宕卞Ο纰辨锤闂佸搫绋侀崢鑲╁婵犳碍鐓欓柟瑙勫姦閸ゆ瑩鏌涢幇銊ヤ壕濠碉紕鍋戦崐鏍箰妤ｅ啫绐楅幖娣灮椤╁弶淇婇妶鍌氫壕闂佸疇顫夐崹鍧楀箖濞嗘挸绾ч柟瀵稿С濡楁捇姊绘担铏广€婇柡鍛洴瀹曨垶寮堕幋鐘虫闂佺鎻粻鎴犵不婵犳碍鍋ｉ柛銉簻閻ㄧ儤銇勮熁閸曨厾鐦堥梺闈涢獜缁插墽娑垫ィ鍐╃叆闁哄浂浜炵粙鑽ょ磼閺冨倸鏋涚€殿喗鎸虫慨鈧柍閿亾闁归绮换娑㈠箻閺夋垹鍔伴梺绋款儐閹瑰洭寮诲鍫闂佸憡鎸婚惄顖氱暦閹存績妲堥柕蹇娾偓铏吅婵＄偑鍊栭悧妤冪矙閹烘垟鏋嶉柣妯肩帛閸婄敻鏌ｉ姀銏℃毄闁靛棗锕弻娑氣偓锝庡亝鐏忕敻鏌熼崣澶嬪唉鐎规洜鍠栭、妤呭磼閿旀儳鑰块梻鍌氬€风粈渚€骞夐敓鐘偓鍐幢濡偐顔曟繝鐢靛Т濞诧箓宕戝Ο姹囦簻闁哄倹瀵ч～宥夋煟閺冨倸甯剁紒鈧崒鐐寸厽闁规崘娅曢幑锝囨喐閻楀牊灏︽慨濠勭帛閹峰懘鎸婃径澶嬬潖闂備礁鍟块崲鏌ユ偋閹惧磭鏆︽繝濠傚暊濡插牓鏌曡箛鏇炐㈤柛銈嗗灴濮婃椽鏌呴悙鑼跺濠⒀冪摠閹便劍绻濋崒銈囧悑閻庤娲樼敮鎺楀煝鎼淬劌绠ｆい鎾跺晿濠婂嫮绡€闁汇垽娼цⅴ闂佺顑嗛幑鍥ь潖濞差亶鏁嗛柍褜鍓涚划鏃堟偨缁嬭法鐣鹃梺缁樺姇閹碱偆绮荤憴鍕闁挎繂楠告晶顔尖攽闄囬崑鎰閹烘绠涙い鎾楀嫮鏉归梻浣告惈婢跺洭鍩€椤掍礁澧柛姘儔楠炴牜鍒掗崗澶婁壕闁肩⒈鍓氶弲濂告⒒閸屾瑧鍔嶆俊鐐叉健瀹曘垽鎮￠獮顒佺☉閳规垹鈧綆浜為悾鍝勨攽鎺抽崐鏇㈠箠韫囨稑鐤鹃柡灞诲劚缁犲湱绱掗鐓庡辅闁稿鎹囬幊鐘活敆娴ｅ摜妯嗘繝鐢靛Х閺佹悂宕戝☉銏″仱闁靛ě鍐ㄧ亰閻庡箍鍎卞ú銈夊垂濠靛鐓欓柟瑙勫姦閸ゆ瑩鏌﹂崘顏勬灈闁哄矉缍佸顒勫垂椤旇棄鈧垶姊洪幖鐐测偓鏇㈩敄閸℃稑桅闁告洦鍨扮粻鎶芥煕閳╁啨浠﹀瑙勬礀閳规垿鎮╁▓鎸庢瘜闂侀€炲苯澧查悘蹇旂懇閹苯鈻庨幘瀵稿幐闁诲繒鍋涙晶钘壝洪弶鎴旀斀闁炽儱纾崺锝団偓瑙勬礀瀹曨剝鐏掔紒鐐妞村憡鏅ラ梻鍌氬€搁崐椋庣矆娓氣偓楠炴牠顢曢敂钘夊壒婵犮垼娉涢張顒€鐣烽崣澶岀瘈闂傚牊绋掗ˉ鐘绘煛閸☆厾鐣甸柡灞剧洴椤㈡洟鏁愰崱娆樻К闂佸摜鍎愰崹璺侯潖濞差亝顥堟繛鎴濈－绾偓闂備胶顭堥張顒傚垝瀹ュ鏅煫鍥ㄧ⊕閳锋帡鏌涚仦鎹愬闁逞屽墰閸忔﹢骞冮悙鐑樻櫆闁伙絽鐬奸鏇熺節閻㈤潧孝婵炲眰鍊楃槐鎺楀煛閸涱喒鎷哄銈嗗坊閸嬫挾绱掓径瀣唉鐎规洖缍婂畷鎺楁倷鐎电骞堥柣鐔哥矊闁帮綁濡撮崘顔煎窛閻庢稒锚閻濇棃姊虹紒妯荤叆闁硅姤绮庣划缁樸偅閸愨晝鍘甸柣搴ｆ暩椤牓鍩€椤掍礁鐏ユい顐ｇ箞椤㈡牠鍩＄€ｎ剛袦閻庤娲栭妶鎼佸箖閵忋垻鐭欓柛顭戝枙缁辩喎鈹戦悩鑼闁哄绨遍崑鎾诲箛閺夎法锛涢梺鐟板⒔缁垶鎮￠悢闀愮箚闁靛牆鍊告禍鎯р攽閳藉棗浜濋柣鐔濆洤鐒垫い鎺戝濞懷囨煏閸喐鍊愰柣娑卞櫍瀹曞爼顢楁担闀愮綍闂備礁澹婇崑鍛枈瀹ュ洠鍋撳鍐蹭汗缂佽鲸鎹囧畷鎺戭潩椤戣棄浜鹃柣鎴ｅГ閸婂潡鏌ㄩ弴鐐测偓褰掑疾椤忓棛纾介柛灞剧懅閸斿秵銇勯妸銉︻棤闁轰緡鍣ｉ幃娆撳垂椤愵偅缍楅梻浣告贡閸嬫捇宕滃璺鸿Е閻庯綆鍠楅悡鏇熺節婵犲倸鏆欓柡鍡愬灲閺屾稑顫濋悡搴濆枈闂佽鍠楅〃鍛村煝閹捐鍨傛い鏃傛櫕娴犲本淇婇悙顏勨偓鏍р枖閿曞倸鐐婄憸蹇涘矗閳ь剙鈹戦悩顔肩伇婵炲鐩垾锕傤敆閳ь剟鈥﹂崶顒€鐓涢柛娑卞枤閸欏棗鈹戦悩缁樻锭婵☆偅鐟╁畷宕囩矙濞嗗墽鍞甸柣鐔哥懃鐎氼厾绮堢€ｎ偅鍙忓┑鐘插暞閵囨繃顨ラ悙鏉戝闁诡垱妫冮弫鎰板炊閳哄倹顔撳┑鐘茬棄閺夊簱鍋撳Δ浣瑰弿闁圭虎鍠栫粻鐔兼煥濞戞ê顏柣顓烆槺閳ь剙绠嶉崕閬嶅箠婢舵劕缁╁ù鐘差儐閻撴洘銇勯幇鍓佺К濠㈣锚闇夋繝濠傜墢閻ｆ椽鏌熼鐓庢Щ闁宠姘︾粻娑㈠箼閸愌呮／缂傚倸鍊风拋鏌ュ磻閹剧粯鐓冪憸婊堝礈閻斿娼栨繛宸簻娴肩娀鏌涢弴銊ュ箹闁冲嘲鐗撳娲川婵犲啫鏆楅梺鍝ュУ閻楃娀骞?${selectedDetail.id}`,
      () => adapter.updateDesignQuantity(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳牠鈥﹂悜钘夋瀬闁归偊鍘肩欢鐐测攽閻樻彃顏撮柛鐔奉儔濮婄粯鎷呴悷鏉垮Б濠电偛鐡ㄥ畝绋跨暦閹达箑宸濇い鎾跺У濞堥箖姊洪崨濠傚婵☆垰锕ら妴鎺撶節濮橆厾鍘梺鍓插亝缁诲啴藟閻愮儤鐓熼柟鎯у船閸旀粓鏌曢崶褍顏柡浣稿暣瀹曟帒鈽夊▎鎾存殬濠碉紕鍋戦崐銈夊磻閸曨厽宕查柟杈剧畱鍥撮梺鎸庢⒒閸嬫捇宕幋锔界厪闁割偅绻傞顏堟煟椤愩垻绠绘慨濠勭帛閹峰懘宕ㄦ繝鍛攨闂備胶顭堢花娲磹濠靛棛鏆︾憸鐗堝笒缁狀噣鏌﹀Ο渚Ш闁绘稏鍎茬换婵嬫偨闂堟刀銏＄箾鐠囇呯暤闁糕晜鐩獮瀣晜閻ｅ苯骞堟繝鐢靛仦閸ㄥ爼鏁冮锕€缁╁┑鐘崇閸婂爼鐓崶褔顎楃€规挸妫濋弻鈥崇暆鐎ｎ剛袦闂佺硶鏂侀崜婵堟崲濠靛纾兼繝濞惧亾闁告繃顨婂缁樻媴妞嬪簼瑕嗙紓浣瑰絻濞尖€崇暦濡も偓铻ｇ紓浣姑鍧楁⒑闁偛鑻晶鎾煛鐏炵偓绀嬬€规洜鍘ч埞鎴﹀幢閳轰礁唯闂傚倷绀侀幖顐﹀箠韫囨洘宕查柛顐ｇ箥濞兼牗绻涘顔荤盎缂佺姳鍗抽獮鏍ㄦ綇閸撗勫仹闂佷紮缍佸褔鍩為幋锔藉€烽柤纰卞墯閸曢箖姊洪崨濠冣拹闁搞劌娼￠悰顕€宕卞Ο鑲╂嚌闂侀€炲苯澧柣锝囧厴閹剝鎯斿Ο缁樻澑闂備礁鎲￠崝蹇涘疾濠婂牆绾ч柟闂寸劍閳锋帒霉閿濆牊顏犻悽顖涚洴閺屾盯寮埀顒勨€﹂崶銊ь洸缂佸绨遍弸搴ㄦ煙闁箑骞楅柣婵堝厴濮婃椽宕崟顒€鍋嶉梺鎼炲妽濡炰粙骞冮敓鐘冲亜闁兼祴鏅涜ぐ鍕⒑閹肩偛鍔橀柛鏂跨Ч閸╂盯骞掗弮鍌滐紲闂佺粯锕㈠褎绂掗柆宥嗙厸鐎光偓閳ь剟宕伴弽顓溾偓浣糕枎閹捐櫕顥濋梺闈涚墕閻楀啴宕戦幘璇查敜婵°倓鑳堕崢闈涱渻閵堝棙顥嗘い顐㈩槸閳诲秹宕堕埡鍐紲闁哄鐗勯崝宀€绮幒妤佹嚉闁挎繂顦伴悡鐔兼煙閻愵剙鈻曟い搴㈩殔閳规垿鍨鹃搹顐㈡灎濠殿喖锕ら…宄扮暦閹烘垟鏋庨柟鎼幗琚︽繝鐢靛О閸ㄥ骞婇幘缁樻櫇妞ゅ繐瀚弳锕傛煙鏉堝墽鐣辨鐐灪缁绘盯骞嬮悜鍡欏姺闂佺粯绋忛崕闈涱潖濞差亜鎹舵い鎾跺剱閺嗩厼鈹戦悩顔肩仾妞ゎ厼娲︾粩鐔煎即鎺虫禍褰掓煙閻戞ɑ灏甸柛妯兼暬濮婄粯绗熼崶褍浼庣紓浣哄У閸ㄥ灝顕ｉ幖浣哥缂備焦顭囬崢閬嶆煟鎼搭垳绉甸柛瀣噽娴滄悂顢橀姀锛勫帗缂傚倷鐒﹁摫鐎规洖鐬奸埀顒冾潐濞叉牜绱炴繝鍥モ偓浣糕枎閹炬潙浠奸柣蹇曞仜閵堟悂宕戝Δ浣虹瘈缁炬澘顦辩壕鍧楁煕鐎ｎ偄鐏寸€规洘鍔欐俊鑸靛緞婵犲倸浜跺┑掳鍊х徊浠嬪疮椤愩倗鐭嗛柛灞剧⊕閸欏繑淇婇悙棰濆殭濞存粓绠栧铏圭磼濡湱绻侀梺闈╃秶缁蹭粙鎮惧畡閭︽建闁逞屽墴閵嗕礁鈻庨幋婵囩€抽柡澶婄墑閸斿海绮旈柆宥嗏拻闁稿本鐟х粣鏃€绻涙担鍐叉处閸嬪鏌涢埄鍐︿簵婵炴垶顭傞弮鍫濆窛妞ゆ挾濮存慨锔戒繆閻愵亜鈧牜鏁幒妤€纾归柤濮愬€栭弳婊勭箾閹寸偑鈧帗鎯旈妸銉у€為悷婊勭箞閻擃剟顢楁担鍏哥盎闂侀潧楠忕槐鏇㈠煡婢跺浜滄い鎾寸矊婵倻鈧娲橀敃銏′繆閹间礁唯妞ゆ棃鏁崑鎾绘焼瀹ュ棌鎷婚梺绋挎湰閻燂妇绮婇悧鍫涗簻闁哄洤妫楅幊澶愬磻閹捐鍨傛い鎰╁灪鐠囩偤鎮楃憴鍕┛缂傚秳绀侀悾宄邦潨閳ь剟鍨鹃敃鍌氱闁绘劗鏁搁埢澶岀磽閸屾艾鈧悂宕愰悜鑺ュ€块柨鏇氱劍閹冲苯鈹戦悩鎰佸晱闁搞劑浜堕獮鎰板箮閽樺鎽曞┑鐐村灦鑿ゆ俊鎻掔墛閹便劌螖閳ь剟鎮ч崱妯侯嚤闁规壆澧楅埛鎴︽煕濠靛棗顏い銉︾矒閺岋絽螖閳ь剙螞濠靛鏄ラ柣鎰惈缁狅綁鏌ㄩ弮鍥棄闁逞屽墮閸㈣尪鐏嬮梺缁橆殔閻楀繒绮婚幘瀵哥闁割偆鍠撶粻妯肩磼鏉堛劍灏伴柟宄版嚇瀹曨偊宕熼幋顖滅М闁哄瞼鍠栧畷銊︾節閸愩劉鍋撻幇鐗堢厵妞ゆ洍鍋撶紒鐘崇墵楠炲啫顭ㄩ崼鐔风檮婵犮垼娉涢惌鍫ュ触閸涘瓨鈷掑ù锝囨嚀椤曟粍绻涢幓鎺斝х€规洘鍨块獮姗€宕滄担鐚寸床闂備線鈧偛鑻晶浼存煃瑜滈崜銊х礊閸℃稑纾诲ù锝呮贡椤╁弶绻濇繝鍌滃闁绘挻鐩弻娑㈠Ψ閵忊剝鐝旀繛瀵稿缁犳捇寮诲☉銏℃櫜闁搞儜鍐瀱缂傚倷鑳剁划顖滄崲閸喐鍙忛柍褜鍓熼弻宥夊煛娴ｅ憡娈紒鐐劤閸熷潡鍩為幋锔绘晩缁绢厼鍢叉导鎰渻閵堝骸骞栭柛銏＄叀閹箖鎮滈挊澶岊唺闂佽鎯岄崢浠嬪磽闂堟侗娓婚柕鍫濇閻忚鲸淇婇銏狀仾缂佸倸绉甸妶锝夊礃閳哄啫骞嶉梻鍌氬€搁崐鎼侇敋椤撯懞鍥晜閸撗勶紡闂佸憡鎸嗛崟顐ｇ暚婵＄偑鍊ゆ禍婊堝疮娴兼潙鐒垫い鎺戯功缁夐潧霉濠婂嫮绠炴鐐村灴閺佹劖寰勭€ｎ剙骞楁俊鐐€栭幐楣冨磻閻愭牳澶婎煥閸喓鍘梺绯曞墲閿氱紒妤佸笚閵囧嫰顢曢敐鍥╃杽闂佽桨鐒﹂崝娆忕暦閵娾晩鏁嗛柍褜鍓熻棢婵﹩鍏橀弨浠嬪箳閹惰棄纾规俊銈勭劍閸欏繘鏌ｉ幋锝嗩棄缁惧墽绮换娑㈠箣閺冣偓閸ゅ秹鏌涢妷顔煎闁稿鍔庣槐鎺斺偓锝庡亜椤曟粓鏌ｆ惔顔煎⒋婵﹥妞介幃鐑藉级鎼存挻瀵栫紓鍌欑贰閸ｎ噣宕圭捄铏规殾闁硅揪绠戠粻娑㈡煟濡も偓閻楀繘宕㈤崡鐐╂斀闁绘劕寮堕ˉ婊勭箾鐎涙澹橀崡閬嶆煕閿旇骞楅柛瀣墵閺屻劌鈹戦崱鈺傂ч梺鎶芥敱鐢繝寮诲☉姘勃闁告挆鍕珮婵＄偑鍊х拋锝囩不閹捐钃熼柣鏃傚劋鐎氭氨鎲歌箛鏇炲К闁逞屽墴閹鎲撮崟顒傤槰缂備浇顕ч悧鎾愁嚕椤愶箑绀冩い鏃囧亹閿涙粌鈹戦绛嬬劸濞存粠鍓欓悾鐑藉醇閺囩啿鎷绘繛杈剧到閹诧繝骞嗛崼銏㈢＜閻庯絺鏅濈粣鏃傗偓瑙勬礃閸ㄥ灝鐣烽悢纰辨晬闁逞屽墯瀵板嫭绻濇惔銏犲厞婵＄偑鍊栭崹鍏兼叏閵堝妫橀柍褜鍓熷缁樻媴閾忕懓绗￠梺鎸庢皑閻ヮ亞绱掗姀鐘茬睄闂侀潧妫楅崐鍨嚕婵犳艾唯闁挎梹鍎抽獮妤呮⒒娴ｇ瓔娼愰柛搴㈠▕椤㈡岸顢橀姀鐘电枃闂佹悶鍎洪崜姘舵偂濞戙垺鍊堕柣鎰絻閳锋梹绻涢幓鎺旀憼妞ゃ劊鍎甸幃娆撴偪濞堝じ娴烽柣蹇撳暣濮婃椽鏌呴悙鑼跺濠⒀冪摠椤ㄣ儵鎮欑拠褎鏁鹃梺璇″灡濡啴寮幇鏉跨倞闁冲搫鍟▓浠嬫⒒閸屾瑦绁版繛澶嬫礋瀹曚即骞樼€涙ê寮块梺姹囧灮椤牓鎮?${payload.itemName}`, () => adapter.createDesignQuantity(payload));
  }

  resetDesignQuantityForm();
}

async function handleResourceLogSubmit(event) {
  event.preventDefault();
  const resourceName = elements.resourceName.value.trim();
  if (!resourceName) {
    logAction("Resource log save failed: resource name is required");
    renderLog();
    return;
  }

  const payload = {
    workAreaId: elements.resourceWorkArea.value,
    resourceType: elements.resourceType.value,
    resourceCategory: elements.resourceCategory.value,
    resourceSubtype: elements.resourceSubtype.value.trim(),
    resourceName,
    quantity: Number(elements.resourceQuantity.value || 0),
    unit: elements.resourceUnit.value.trim(),
    recordDay: Number(elements.resourceDay.value || 0),
    teamName: elements.resourceTeamName.value.trim(),
    specification: elements.resourceSpecification.value.trim(),
    sourceType: elements.resourceSourceType.value,
    supplier: elements.resourceSupplier.value.trim(),
    notes: elements.resourceNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "resourceLog") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垿鏌熺粙鎸庢崳缂佺姵鎸绘穱濠囶敃閵忕媭鍔夌紓浣稿€哥粔鎾€﹂妸鈺侀唶闁绘柨鎼敮楣冩⒒婵犲骸浜滄繛灞傚€濋弫鍐Χ閸℃ɑ鐝烽梺鍛婄懃椤︻厽绂嶅鍫熺厪濠㈣泛鐗嗛崝銈咁熆瑜庨惄顖炲蓟閺囥垹鐐婄憸宥夘敂椤撶偐鏀芥い鏃傛嚀娴滈箖姊绘担瑙勭伇闁哄懏鐩畷鏉款潩椤戔晜鐩畷姗€顢欓挊澶嗗亾閻㈠憡鍋℃繛鍡楃箰椤忣亞绱掗埀顒勫焵椤掑嫭鈷戦梻鍫熺〒婢ф盯鏌熼鐓庘偓鍧楁偘椤曗偓瀹曟﹢顢欑喊杈ㄧ秱婵＄偑鍊ら崑鎺楀储妤ｅ啫绀堥柕濠忓缁犻箖寮堕崼婵嗏挃缂佸鍣ｉ弻锟犲川椤撶偟楠囩紓浣规⒒閸犳牕顕ｉ幘顔碱潊闁抽敮鍋撻柟閿嬫そ濮婃椽宕ㄦ繝鍐ㄩ瀺閻熸粍婢橀崯顖滅矉瀹ュ應鏀介柛銉㈡櫇椤旀洟姊洪崨濠勬噧妞わ箓浜堕幆宀勫箳閺傚搫浜鹃悷娆忓缁岃法绱撳鍕獢闁绘侗鍠栬灒闁兼祴鏅濋敍婊冣攽閳藉棗鐏ｉ柛妯犲洨宓侀柛顐犲劜閳锋帒銆掑锝呬壕濠电偘鍖犻崵韬插姂閸┾偓妞ゆ帒鍊荤壕濂告煠閼圭増纭剧悮姘箾閿濆懏鎼愰柨鏇ㄤ邯楠炲啴宕滆濞岊亞绱掔€ｎ亗浠掑瑙勬礋閺岋綁鎮㈤崫銉﹀櫑闁诲孩鍑归崢鍓у垝閸儱鐒垫い鎺戝閳锋垶绻涢懠棰濆殭妤犵偞鐗犻弻娑欑節閸屾粈铏庡銈嗘穿缁插潡骞忛悩瑁佸湱鈧綆鍋掑鏃€绻濈喊妯活潑闁搞劌鐖煎銊╂焼瀹ュ棗鈧潧鈹戦悩宕囶暡妞ゃ儱锕ラ妵鍕箛閳轰胶浠炬繝銏ｆ硾鐎氫即寮婚悢杞扮剨闁哄秲鍔嶉悵鏇㈡煟鎼淬劍娑ч柕鍫㈩焾閻ｅ嘲顫滈埀顒勩€佸▎鎴炲枂闁挎繂妫楅褰掓⒒閸屾瑧顦﹂柟璇х磿閹广垽宕掑┃鎯т壕婵鍘у▍宥夋煙椤旀儳浠ч柟鐟板婵℃瓕顦撮柨娑欑矒閺屸剝寰勬繝鍕暥闂佸憡鏌ㄧ粔鍓佸垝閸儱绀冩い蹇撴閿涙粓姊虹粙鎸庢拱缂佸鍨甸湁妞ゆ洍鍋撻柡灞稿墲閹峰懐绮欓幐搴㈩啋闁诲氦顫夊ú妯兼暜閹烘缍栨繝闈涙祩濞兼瑩鏌″鍐ㄥ闁靛牆顦伴埛鎴︽煠婵劕鈧洟寮搁幋鐘电＜妞ゆ棁鍋愰悞鎼佹煛鐏炴枻韬柡浣瑰姍瀹曘劑顢涘☉娆樺晭濠电姵顔栭崰妤呮晝閳哄懎绀傛俊顖欑秿閿濆閱囬柕澶涘閸橆亪妫呴銏℃悙閼瑰矂鏌涚€ｎ偅宕岀€殿噮鍓熸俊鐑藉Ψ閵堝拋妫滈梻鍌欑婢瑰﹪鎮￠崼銉ョ；闁糕剝鐟ф稉宥呂旈敐鍛殲闁绘挻娲橀妵鍕箛閸撲焦鍋х紓浣哄У閿氶棁澶愭煟濮楀棗鏋涢柣蹇旂叀閺屸€崇暆鐎ｎ剛锛熼梺閫炲苯澧剧紓宥呮瀹曟粌鈻庨幘鍐插殤濠电偞鍨崹娲偂濞戞埃鍋撻崗澶婁壕闂侀€炲苯澧寸€规洜澧楅幆鏃堚€﹂幒鏃傗棨闂備線娼уù姘熆閳ь剚绻涘畝濠侀偗闁哄本鐩獮妯何旈埀顒勫疮椤栫偞鐓ユい鎾跺枔缁♀偓闂佹眹鍨藉褔宕滃畷鍥╃＜闁艰壈鍩栭ˉ澶愭偂閵堝鐓忛柛顐ｇ箥濡插綊鏌￠崨顔剧畺闁靛洤瀚粻娑㈠箻鐠鸿　鍙￠柣搴ゎ潐閹搁娆㈠璺鸿摕闁炽儲鍓氶崥瀣煕閹扳晛濡兼い顒€顦扮换婵嗏枔閸喚浠梺鐟版啞婵炲﹤顕ｆ繝姘у璺猴功閻撴垶绻濋姀锝嗙【闁活剝鍋愬Σ鎰鐎涙ǚ鎷洪梺鍛婄☉閿曘儵鍩涢幇鐗堢厱闁靛鍎虫禒銏°亜閺囶亞绋荤紒缁樼箓椤繈顢楅埀顒€鐣甸崱娑欌拺缂備焦蓱椤ュ牊銇勯妷锔藉暗缂侇噯缍侀幃娆徝圭€ｎ偅鏉搁梻浣哥枃濡嫬螞濡ゅ懏鍊堕柨婵嗩槹閻撴洟骞栫€涙鈽夐柍褜鍓氱换鍫ョ嵁閸愩剮鐔哥瑹椤栨碍鍊梻浣虹《閸撴繂煤濠婂懐涓嶆慨妯垮煐閳锋垿姊婚崼鐔恒€掑褎娲樼换娑氫沪閸屾埃鍋撻弴銏″仱妞ゆ挶鍨洪埛鎴︽偣閸ャ劌绲绘い鎺嬪灮閻ヮ亪寮剁捄銊愩垺銇勯鐐典虎妞ゎ偅绮撻崺鈧い鎺戝閺呮煡鏌ｉ幇顒€顣抽柣銈傚亾闂備礁鎼崯顐﹀磹婵犳碍鍎婇柛顐ｇ妇閺€鑺ャ亜閺冣偓閺嬬粯绗熷☉銏＄厱闁规儳顕ú鎾煛娴ｅ摜孝妞ゎ厹鍔戝畷姗€鏁愰崱妯绘緫闂傚倷鑳剁划顖炲礉閺囩儐鍤曢柛顐ｆ硻婢舵劖鍊烽柣鎴灻禒鍝勵渻閵堝棛澧紒瀣灥闇夋い鏃堟暜閸嬫挾鎲撮崟顒傦紭闂佹悶鍔嬬划娆忣嚕椤愩埄鍚嬪璺猴功椤︽澘顪冮妶鍡樺暗濠殿垰顕Σ鎰板礃濞村鏂€闂佺粯鍔曢悺銊т焊娴煎瓨鐓犻悷娆忓閸斻倝鎮￠妶澶嬬厪闁割偅绻冮崳鎶芥煛鐎ｎ亞校闁逛究鍔岄—鍐嫚闊厼顥氶梻鍌欑閹碱偊寮甸鍕剮妞ゆ牗绋愮换鍡涙煙闂傚顦﹂崬顖炴偡濠婂啰效闁诡噯绻濋幃銏ゆ嚃閻戞ɑ顥堥柟顔规櫊濡啫鈽夊Δ鍐╁礋闂傚倷绀侀幗婊堝窗閹邦厾绠惧┑鐘叉噺椤ャ倝鏌ｉ悢鍝ョ煂濠⒀勵殘閺侇喖螖閸涱喖浜楀┑鐐叉閸旀垶绂嶅鍫熺厸闁告劑鍔嶇粊鈺傜箾閸忕厧濮堢紒缁樼洴瀹曘劑顢橀悢閿嬬暬闂備礁鎼惌澶岀礊娓氣偓瀵偊骞囬弶璺ㄥ€為悷婊冪Ч閻涱喚鈧綆鍠楅崐鐢告偡濞嗗繐顏紒鈧埀顒勬⒑缂佹澧柕鍫熸倐閻涱喗绻濋崒銈囧弳闂佸壊鍋嗛崰搴㈢濞差亝鈷戦柛娑橈功閳藉鏌ㄩ弴妯哄姎闁崇粯鎹囧顕€宕奸悢鍙夊闂備胶顭堥張顒勬嚌妤ｅ啫鐒垫い鎺嶇劍閸婃劗鈧娲橀崝鏍囬悧鍫熷劅闁挎繂娲ㄩ崝璺衡攽閻愯埖褰х紒鑼舵閿曘垽鏌嗗鍡椾户闁荤娀缂氶妴鈧柡鈧禒瀣厽婵☆垰鎼痪褔鏌熼崗鐓庡闁汇儺浜獮鍡氼檨闁绘挸銈搁弻锛勪沪閸撗€妲堥梺瀹犳椤﹂潧鐣烽敓鐘冲€锋繛鍫濐儜缁犳垿鍩為幋锔藉€烽柛娆忣槴閺嬫瑦绻涚€涙鐭嬬紒顔芥尭閻ｅ嘲顫滈埀顒勫春閳ь剚銇勯幒鍡椾壕濡炪値浜滈崯瀛樹繆閸洖骞㈡俊顖滃劋濞堫偊姊绘担鍛婃喐濠殿喗鎸抽弻濠囨晲婢跺﹦鐣洪梺姹囧灮椤牏鐚惧澶嬬厱妞ゆ劑鍊曢弳閬嶆煙閻ゎ垱顏犵紒杈ㄦ崌瀹曟帒鈻庨幋婵嗩瀴闂佽棄鍟存禍鍫曞蓟閿濆绠婚柛妤冨仜婵箓姊洪崫鍕拱缂佸鍨块敐鐐测攽鐎ｅ灚鏅㈡繝銏ｆ硾閿曘倖绔熸惔銊︹拻濞达絿鐡旈崵鍐煕閿濆骸鐏ｉ柟骞垮灩閳规垹鈧綆浜為悾娲⒑闂堟稓绠為柛濠冩礈缁牓宕掗悙瀵稿幘濠电偞娼欓鍡椻枍閸涱噮娈介柣鎰綑婵秵鎱ㄦ繝鍕笡闁瑰嘲鎳忕粭鐔碱敍濠婂啫歇闂傚倷绀侀幖顐︽偋濠婂牆绀堟繛鍡樻惈缂嶆牗绻濋棃娑卞剰閹喖姊洪幐搴⑩拻闁惧繐楠搁湁闁告洦鍨遍埛鎴︽⒒閸喓銆掔紒鐘靛仱閺屾稒绻濋崘顏勨拰闂佽鍠掗埀顒佹灱閺嬪酣鏌熼幍铏珒缂併劌顭峰娲传閸曨偅娈┑鐐额嚋缁犳捁妫㈡繝銏ｅ煐閸旀牠鎮￠悢鑲╁彄闁搞儯鍔嶉埛鎰版倶韫囥儳鐣甸柡灞糕偓宕囨殕閻庯綆鍓涢敍鐔哥箾鐎电顎撶紒鐘虫尭閻ｅ嘲顭ㄩ崱鈺傂梻浣告啞鐢绮欓幒鏃€宕叉繝闈涚墕閺嬪牊淇婇姘Щ濞存粌澧介埀顒冾潐濞叉牕煤閵堝鍋傞柣鏂垮悑閸婄敻鎮峰▎蹇擃仾濠㈣泛瀚湁婵犲﹤瀚粻鐐搭殽閻愯尙绠荤€规洏鍔戦、娑橆煥閸涱垰骞嗛梻鍌欑婢瑰﹪鎮￠崼銉ラ棷妞ゆ柨妲堝☉銏犵闁挎棁袙閹峰姊虹粙鎸庢拱闁煎綊绠栭崺鈧い鎺戝濡垹绱掗鑲╁缂佹鍠栭崺鈧い鎺戝瀹撲線鏌″搴″季闁轰礁鍟撮弻銊╁即濡も偓娴滈箖鏌ｆ惔銏ｅ妞わ缚鍗虫俊鐢稿礋椤栨氨顔婇梺鐟扮摠缁诲秵绂掓ィ鍐┾拺缂佸娼￠妤呮倵濞戞帗娅婂┑锛勬暬瀹曠喖顢涘顒€鏁ゆ俊鐐€栭崝锕€顭块埀顒傜磼椤旇偐鍩ｆ慨濠呮閹风娀鎳犻鍌ゅ敼濠电姷鏁搁崑娑㈡晝椤忓嫷鍤曞┑鐘宠壘鎯熼梺瀹犳〃缁€浣哥暤閸℃稒鈷戠紓浣姑慨鍫㈢磼娴ｈ灏︾€规洘鍨块獮妯兼嫚闊厾鐐婇梻渚€娼ч敍蹇涘磼濠婂懏鍠掗梻鍌氬€烽悞锔锯偓绗涘懏宕查柛灞绢嚤濞戞ǚ妲堟慨姗嗗墮琚ｉ梻渚€鈧偛鑻晶瀛樻叏婵犲偆鐓肩€规洘甯掗～婵嬪础閻戝棙婢戠紓鍌氬€风粈渚€顢栭崱娆愭殰闁炽儱纾弳锕傛煣韫囷絽浜炴い鈺冨厴閹鏁愭惔鈥茬敖闂佸憡锚閹诧紕鎹㈠☉娆愮秶闁告挆鍐ㄧ厒婵犵數濮崑鎾诲级閸稑濡芥繛鍛У閵囧嫰骞掗崱妞惧闂佸吋瀵ч崝娆撳蓟濞戙垹唯闁瑰瓨绻勫暩闂佸憡鍑归崑濠傤潖閾忚瀚氶柍銉ㄦ珪閻忓秹姊洪懡銈呮毐闁哄懐濞€婵″瓨绗熼埀顒€顕ｉ鈧畷鐓庘攽閸偅效闂傚倷绶氬褔鈥﹂崼銉ョ？闁绘鐗忛悵鍫曟煛閸ャ儱鐏柛瀣у墲缁绘繃绻濋崒姘缂備胶濮风划顖炪€冮妷鈺傚€烽柤纰卞墰椤旀垿姊洪棃娑欏闁告梹鐟╅悰顕€骞掑Δ鈧粻濠氭煕韫囨挻鍣介柣鈺侀叄濮婂宕掑▎鎺戝帯缂備緡鍣崹鍫曠嵁閹邦喚鐭欐俊顐︽涧缂嶅﹪骞冨鍫熷殟闁靛闄勯悵顐︽⒒娴ｈ櫣甯涢柡灞诲姂瀹曘儳鈧綆鍠栭悡鏇㈡煙閻戞﹩娈曢柣鎾存礋閹﹢鎮欓棃娑楀闂佹眹鍔嶉崹鐢糕€﹂懗顖ｆЪ缂備礁顑嗛崹鎸庝繆閹绢喖绠抽柟鎼幗閸嶉潧顪冮妶鍡樺瘷闁告洦鍘藉▓钘夆攽?${selectedDetail.id}`,
      () => adapter.updateResourceLog(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳牠鈥﹂悜钘夋瀬闁归偊鍘肩欢鐐测攽閻樻彃顏撮柛鐔奉儔濮婄粯鎷呴悷鏉垮Б濠电偛鐡ㄥ畝绋跨暦閹达箑宸濇い鎾跺У濞堥箖姊洪崨濠傚婵☆垰锕ら妴鎺撶節濮橆厾鍘梺鍓插亝缁诲啴藟閻愮儤鐓熼柟鎯у船閸旀粓鏌曢崶褍顏柡浣稿暣瀹曟帒鈽夊▎鎾存殬濠碉紕鍋戦崐銈夊磻閸曨厽宕查柟杈剧畱鍥撮梺鎸庢⒒閸嬫捇宕幋锔界厪闁割偅绻傞顏堟煟椤愩垻绠绘慨濠勭帛閹峰懘宕ㄦ繝鍛攨闂備胶顭堢花娲磹濠靛棛鏆︾憸鐗堝笒缁狀噣鏌﹀Ο渚Ш闁绘稏鍎茬换婵嬫偨闂堟刀銏＄箾鐠囇呯暤闁糕晜鐩獮瀣晜閻ｅ苯骞堟繝鐢靛仦閸ㄥ爼鏁冮锕€缁╁┑鐘崇閸婂爼鐓崶褔顎楃€规挸妫濋弻鈥崇暆鐎ｎ剛袦闂佺硶鏂侀崜婵堟崲濠靛纾兼繝濞惧亾闁告繃顨婂缁樻媴妞嬪簼瑕嗙紓浣瑰絻濞尖€崇暦濡も偓铻ｇ紓浣姑鍧楁⒑闁偛鑻晶鎾煛鐏炵偓绀嬬€规洜鍘ч埞鎴﹀幢閳轰礁唯闂傚倷绀侀幖顐﹀箠韫囨洘宕查柛顐ｇ箥濞兼牗绻涘顔荤盎缂佺姳鍗抽獮鏍垝鐟欏嫬娅氶梺鐟板槻椤嘲顫忓ú顏勪紶闁告洦鍓欓娑㈡⒑缁嬫鍎忛柨鏇樺€濋幃楣冩倻閽樺娼婇梺鎸庣☉鐎氬嘲霉閸曨垱鐓熼幖鎼灣缁夌敻鏌涚€ｎ偄绗掗摶鐐烘煕濞戝崬寮炬繛鎾愁煼閺屾洟宕煎┑鍥舵婵犳鍠栭崐鍧楀蓟濞戙垹惟鐟滃秹宕濈€ｎ兘鍋撻崹顐ｇ凡閻庢碍婢橀悾鐑芥偄绾拌鲸鏅┑鐐村灦閼归箖鐛鍥╃＝闁稿本鐟чˇ锔姐亜閹存繃鍤囬柟顔矫埞鎴犫偓锝庝簽閸橀亶姊洪崫鍕殭闁稿﹨宕垫竟鏇㈠礂缁楄桨绨婚梺鍝勫€搁悘婵嬪煕閺冨牊鍋ㄦい鏍ㄧ〒濞叉挳鏌熼绛嬫畷闁瑰嘲鎳樺畷姗€濡搁妶鍡欐綎闂傚倷绶氶埀顒傚仜閼活垱鏅堕婊呯＜閻庯綆鍋勭粭鈺冩喐閻楀牏鐭掓慨濠囩細閵囨劙骞掗幘瀛樻婵犵绱曢崑妯煎垝濞嗗浚鍤曞┑鐘崇閺呮彃顭跨捄渚叕婵炵厧锕铏光偓鍦У閵嗗啴鏌ょ€圭姴鐓愰悗闈涖偢瀹曞爼顢楁担鍙夊闂備礁鎲＄缓鍧楀磿鏉堛劎澧″┑鐘愁問閸犳褰犻梺鍛婃煥闁帮絽鐣峰璺虹婵°倐鍋撶紒顐㈢Ч閺屾盯顢曢顫凹闂佸搫鎳夐弲鐘差潖缂佹ɑ濯撮悹鍥ｂ偓鍐插闂備焦鎮堕崝搴㈡櫠濡ゅ啰鐭夌€广儱顦伴崐閿嬨亜閹烘垵鈧顢欓弴銏♀拺闁告挻褰冩禍婵堢磼鐠囨彃顏紒鍌涘浮婵偓闁靛牆妫涢崢鎼佹煟鎼搭垳鍒伴柣鏍帶椤﹪顢氶埀顒勫蓟閺囥垹鐐婄憸宥夘敂椤撶姭鍋撳▓鍨灍闁圭鍟块悾鐑藉础閻愬秵姊归幏鍛喆閸曨偀鍋撻悜鑺モ拻濞达綀娅ｇ敮娑㈡煙閸涘﹥灏﹂柛鈹惧亾濡炪倖甯婄粈浣规櫠椤栫偞鐓熼柡鍌涘椤ャ垽鏌＄仦璇测偓婵嬬嵁閺嶃劍濯撮悷娆忓閺侇亜鈹戦悩鎰佸晱闁哥姵鐗曠叅闁挎洖鍊告闂佸憡娲﹂崹濂稿极閸愵喗鐓忛煫鍥堥崑鎾绘惞椤愩倖姣堥梻鍌氬€风粈渚€骞栭锔藉剹濠㈣泛鑻欢銈夋煕婵犲嫬鏋斿ù婊€绮欏娲嚒閵堝憛銏＄箾濞村娅囧ù婊咁焾閳诲酣骞嬮悩鐢靛姼濠碉紕鍋涢鍛规搴☆棜闁芥ê顥㈣ぐ鎺撴櫜濠㈣埖蓱椤ユ牠鏌ｉ悩鍐插闁告濞婂璇测槈閵忊剝娅滈棅顐㈡处濞叉牠宕虹仦绛嬫富闁靛牆楠告禍婊呯磼缂佹ê绗ф俊鍙夊姍楠炴帡骞婂畷鍥ф灈闁硅櫕鐗犻崺锟犲磼濮橆厾鏉介梻鍌氬€搁崐椋庢濮樿泛鐒垫い鎺戝€告禒婊堟煠濞茶鐏￠柡鍛埣椤㈡瑦鎱ㄩ幇顏嗙泿婵＄偑鍊栭幐楣冨磻閻愮數鐭氶柟绋跨昂娴滄粓鏌ㄩ弴妤€浜剧紓鍌氱Т閿曨亜顕ｇ拠宸悑濠㈣泛谩閵婏负浜滈柡宥冨妿閻矂鏌￠崱鎰偓婵嬪箖濡ゅ啯鍠嗛柛鏇ㄥ墰椤︺儵姊洪棃娑氬闁规祴鍓濈粚杈ㄧ節閸ャ劌鈧鏌﹀Ο鐚寸礆闁靛ě鍕瀾濠电娀娼ч悧濠囷綖閺囥垺鐓熼柕蹇曞У閸熺偤鏌嶉柨瀣诞闁哄本绋撴禒锕傚礈瑜庨崳顕€鏌ｉ悩鍐插闁告濞婂璇测槈閵忕姷顔掗柣搴ㄦ涧閹诧繝宕抽鍓х＝濞撴艾娲ら弸鐔兼煟閻斿弶娅呴柣锝囧厴閹垻鍠婃潏銊︽珝闂備胶绮摫妞ゆ梹鐗曞嵄闁归棿鐒﹂埛鎺懨归敐鍛暈闁诡垰鐗忕槐鎺撳緞鐎ｎ剙寮ㄩ悗瑙勬礃缁诲啰鎹㈠┑瀣妞ゅ繐绉甸柨銈嗙節閻㈤潧孝闁挎洏鍊濋幃褎绻濋崶銊ヤ簵濠电偛妫欓幐濠氭偂濞戞﹩鐔嗛悹鍝勬惈椤掋垻鐥鐐靛煟闁哄本鐩崺锛勨偓锝庡墰钃卞┑鐑囩到濞层倝鏁冮敂鐐潟闁圭儤顨呴～鍛存煟濡櫣锛嶇憸鏉块叄濮婄粯鎷呴崨濠冨創闂佸吋妞块崹宕囧垝閺冨洢浜归柟鐑樺灱閹芥洟姊洪棃娴ゆ盯鍩€椤掑嫬纾婚柟鍓х帛閺呮煡骞栫€涙绠橀柡浣圭墬缁绘稓鈧數顭堥瀷闂佺顑嗛崝妤€危閹版澘绠婚悗娑櫭鎾寸箾鐎电孝妞ゆ垵鎳橀獮妤呮偨閸涘ň鎷洪梺闈╁瘜閸欏酣鎮為悙顑句簻妞ゆ挾濮撮崢鎾煟濞戝崬鏋︾紒鐘崇☉閳藉螣閾忓湱宕哄┑锛勫亼閸婃牠鎮уΔ鍐煓闁硅揪闄勯崑鐔访归悡搴ｆ憼闁抽攱鍨块弻鐔虹矙閹稿孩宕抽梺瀹犳椤︾敻骞冨Δ鈧～婵嬫偂鎼粹槅娼介梻渚€鈧稓鈹掗柛鏃€鍨甸悾鐑筋敃閿曗偓缁€瀣煏婵犲繘妾柡澶嬫倐濮婄粯鎷呴搹鐟扮闂佹寧娲嶉弲鐘茬暦閹达箑宸濇い鏃傚帶閻忎焦绻涚€电甯堕柣掳鍔戦幃锟犲即閵忥紕鍘繝銏ｅ煐缁嬫捇宕氶弶搴撴斀闁炽儴灏欓惌娆愭叏婵犲倹鎯堥柍璇查叄楠炲棜顦茬紒顐㈢Т閳规垿顢欑涵宄颁紣濡炪値鍘奸崲鏌ユ偩閻戣棄绠氶梺顓ㄩ檮椤庡洦绻濈喊妯哄⒉鐟滄澘鍟敃銏℃綇閳哄偆娼熼梺鍦劋濮婅崵澹曢崗闂寸箚妞ゆ牗绻傛禍褰掓煟閿濆牊顏犵紒杈ㄦ尰閹峰懘鎼归悷鎵偧缂傚倷娴囬褔鎮ч崱娑欏仼闁绘垼妫勭粻鎶芥煙閹碱厼骞楅柛宥夋涧椤啴濡堕崱妯烘殫闂侀潻绲婚崕闈涚暦椤栫偛鐒垫い鎺戝閳锋帡鏌涚仦鎹愬闁逞屽墰閸忔﹢骞婂Δ鍛濞达絿鎳撻崢褰掓⒑閸撴彃浜濇繛鍙夌墵閹潡鎮欓鍙ョ盎闂婎偄娲﹂幐濠毸夊鍛＜闂婎剚褰冮埀顒佺箞瀵鈽夊搴⑿俊鐐€戦崝宀勫箠濮椻偓楠炲啴鎮欓崫鍕€銈嗗姉婵磭鑺辨繝姘拺闁荤喓澧楅幆鍫㈢磼婢跺﹤顣抽柟鐤潐鐎佃偐鈧稒顭囬崢閬嶆⒑缂佹ɑ顥堟い銉︽尵缁粯绻濆顓犲幐闁诲繒鍋涙晶钘壝洪幘顔界厵妞ゆ棁顫夊▍鍛存煟閿濆洤鍘寸€规洘鍎奸ˇ顕€鏌熼摎鍌氬祮婵﹦绮幏鍛村传閸曨亞绱﹂梻浣侯焾濮橈箑鐣烽悽闈涘灊濠电姵鑹剧粻濠氭偣閸ヮ亜鐨洪柣锝呮惈閳规垿鎮╃拠褍浼愰梺缁橆殔閿曪箓鍩€椤掑倹鏆╁┑顔芥尦閳ワ妇鎹勯妸锕€纾梺鎯х箰濠€杈ㄥ閸ヮ剚鈷戦柛婵嗗閿涘秹鏌涚€ｎ亷宸ユい顐㈢箳缁辨帒螣閼测晜鍤岄梻渚€鈧偛鑻晶顔姐亜椤撶偞绌挎い锔芥尦閺岀喖鐛崹顔句紙閻庤娲栭妶鍛婁繆閻戣棄唯鐟滄繄妲愰鈧缁樻媴閸涘﹥鍎撳┑鐐茬湴閸斿秹骞堥妸鈺傚€婚柤鎭掑劚閸撳綊姊虹化鏇炲⒉缂佸甯￠幃锟犲即閻橆偄浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢у鈧娲橀崹鍧楀箖濞嗘挻鍊绘俊顖濇〃缁ㄧ敻姊绘担铏瑰笡闁哄被鍔戝畷銉р偓锝庡枟閸嬪倹绻涢崱妯诲鞍闁绘挻鐟﹂妵鍕冀瑜庨ˉ婊堟煕閻曚礁鐏犵悮娆撴煙闁箑澧绘繛鎾愁煼閺屾洟宕煎┑鍥舵缂備焦妫冪粻鏍蓟濞戙垹惟闁靛牆娲ㄩ悡鎾绘倵濞堝灝鏋涙い顓犲厴瀵偊骞囬鐐电獮婵犵數鍋愰幏鍐炊閵娧冨箞婵犵數鍋為崹闈涚暦椤掑嫮宓侀柟鎵閻撴洟鎮楅敐搴′簼鐎规洖鐬奸埀顒冾潐濞叉牜绱炴繝鍥モ偓浣割潩鐠哄搫绐涘銈嗘煥婢т粙鍩㈡径宀€纾介柛灞捐壘閳ь剚鎮傚畷鎰版倻閼恒儱鈧潡鏌ㄩ弴姘卞妽闁瑰啿鑻埞鎴︽偐閹颁礁鏅遍梺鎼炲妺閸楁娊銆佸棰濇晣闁绘ɑ鍓氬鐔兼⒑閸︻厼鍔嬮柡宀嬬節瀹曟垿骞樼紒妯绘珳闁硅偐琛ラ埀顒冨蔼閸╁懘姊绘担渚劸缂併劍妞藉畷鏇㈠矗婢跺备鏀虫繝鐢靛Т濞村倿寮崘顔界厪闊洤顑呴悘顕€鏌涢弮鎴濈仩闁宠鍨块、娆戞兜閻戠晫鍙嶆繝鐢靛仜閹锋垹寰婇崹顔ワ綁骞囬弶璺唺闂佺懓鍟跨壕顓㈠窗閹捐绠柣妯肩帛閸ゆ垶銇勯幒鎴Ч婵炲牆缍婂濠氬磼濮橆兘鍋撻悜鑺ュ殑闁告挷绀侀崹婵囥亜閺嶎偄浜奸柍褜鍓欓崯鏉戠暦閸楃偐妲堟俊顖溾拡閸炲爼姊绘担鍝ョШ婵☆偄娼￠幃鐐烘晝閸屾氨锛涢梺鍐叉惈閹冲繘鎮￠悢鍏肩厵閺夊牆澧界粙缁樸亜閵夈儺妲虹紒杈ㄥ浮閹亪宕ㄩ婧炴粓姊洪崫鍕潶闁告梹鍨甸锝夊级閹宠櫕妫冮崺鈧い鎺嶈兌椤╂煡鏌熼锝囦粶闁哄啫鐗婇崑鎰版⒒閸喓鈼ラ柡澶樺弮濮婃椽骞栭悙鎻掝潊濠电偛鎷戠紞渚€鐛幋锕€顫呴柣姗嗗亝椤秴鈹戦鏂ゅ叕缂佽尪濮ょ粋宥夋倷椤掑倻顔曢梺鐟邦嚟閸庢劖瀵奸崱娑欑厵閻庣數顭堟牎濡炪倖鍔掔划娆撳蓟濞戞ǚ鏋庨煫鍥风稻妤旂紓鍌欒兌婵瓨鏅舵禒瀣劦妞ゆ帒鍊归崵鈧繝銏㈡嚀閿曨亜鐣锋导鏉戝唨妞ゆ挾濮寸粊锕€鈹戞幊閸婃劙宕戦幘缁樺殨闁规壆澧楅悡鏇㈡煏婢跺鐏ョ紒澶屽厴瀹曘儵顢曢敂瑙ｆ嫼闁荤姴娲犻埀顒冩珪閻忓秶绱撴笟鍥ф灍闁圭懓娲悰顕€骞囬鐘电槇闂佸憡鍔戦崝搴ｇ玻閻愮儤鐓熼煫鍥ㄦ礀娴犫晜淇婇銏狀伀缂侇喚绮€佃偐鈧稒菤閹峰姊虹粙鎸庢拱闁荤喆鍔戝畷妤冧沪娣囧彉绨诲銈嗘尵閸嬬喐鏅堕敂閿亾濞堝灝鏋ら柡浣割煼閵嗕礁螖閸涱厾顦伴梺瀹狀潐閸庤櫕绂嶆ィ鍐╃厱闁逛即娼ч弸娑欘殽閻愵亜鐏紒缁樼洴瀹曞崬螖閸曨偒浼冨┑?${payload.resourceName}`, () => adapter.createResourceLog(payload));
  }

  resetResourceLogForm();
}

async function handleDesignSpatialSubmit(event) {
  event.preventDefault();
  const name = elements.designSpatialName.value.trim();
  if (!name) {
    logAction("Design spatial save failed: name is required");
    renderLog();
    return;
  }

  const payload = {
    workAreaId: elements.designSpatialWorkArea.value,
    name,
    designType: elements.designSpatialType.value,
    coordSystem: elements.designSpatialCoordSystem.value,
    stationStart: parseOptionalNumber(elements.designSpatialStationStart.value),
    stationEnd: parseOptionalNumber(elements.designSpatialStationEnd.value),
    bboxMinX: parseOptionalNumber(elements.designSpatialBboxMinX.value),
    bboxMinY: parseOptionalNumber(elements.designSpatialBboxMinY.value),
    bboxMinZ: parseOptionalNumber(elements.designSpatialBboxMinZ.value),
    bboxMaxX: parseOptionalNumber(elements.designSpatialBboxMaxX.value),
    bboxMaxY: parseOptionalNumber(elements.designSpatialBboxMaxY.value),
    bboxMaxZ: parseOptionalNumber(elements.designSpatialBboxMaxZ.value),
    elevationTarget: parseOptionalNumber(elements.designSpatialElevationTarget.value),
    designVersion: elements.designSpatialVersion.value.trim(),
    designRef: elements.designSpatialRef.value.trim(),
    notes: elements.designSpatialNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "designSpatial") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垿鏌熺粙鎸庢崳缂佺姵鎸绘穱濠囶敃閵忕媭鍔夌紓浣稿€哥粔鎾€﹂妸鈺侀唶闁绘柨鎼敮楣冩⒒婵犲骸浜滄繛灞傚€濋弫鍐Χ閸℃ɑ鐝烽梺鍛婄懃椤︻厽绂嶅鍫熺厪濠㈣泛鐗嗛崝銈咁熆瑜庨惄顖炲蓟閺囥垹鐐婄憸宥夘敂椤撶偐鏀芥い鏃傛嚀娴滈箖姊绘担瑙勭伇闁哄懏鐩畷鏉款潩椤戔晜鐩畷姗€顢欓挊澶嗗亾閻㈠憡鍋℃繛鍡楃箰椤忣亞绱掗埀顒勫醇閵夛妇鍘遍梺缁樏壕顓熸櫠椤掆偓鑿愰柛銉戝秷鍚Δ鐘靛仦閻楁骞忛崨顖涘枂闁告洦鍓涜ぐ鍡涙⒒閸屾瑧顦﹂柛姘儐缁傚秵绂掔€ｎ亞锛熼梺鑲┾拡閸撴岸顢曢懞銉ｄ簻闁规澘澧庨幃鑲╃磼閳锯偓閸嬫挾绱撴担鍝勪壕婵犮垺锕㈣棟閺夊牃鏅涢ˉ姘舵煕瑜庨〃鍡涙偂閺囥垺鍊甸柨婵嗛娴滄粓鏌ｈ箛鎿冨殶闁逞屽墲椤煤濮椻偓瀹曟繂鈻庤箛锝呮婵炲濮撮鎰板极閸ヮ剚鐓熼柡鍐ㄦ处閼靛湱绱撻崘鈺傜缂佺粯绻傞銉╂煥鐎ｎ偆鍑￠梺閫炲苯澧繛鑼枛閻涱喗绻濋崘鈺佸妳闂侀潧绻掓刊顓㈠吹閵堝鈷戠紓浣癸供閻掔偓銇勯弴鍡楁噽娑撳秹鎮峰▎蹇擃伀缂佺娀绠栭弻銊モ攽閸℃侗鈧顭胯閸犳牠鍩為幋锔筋€愰梺绋款儐閸旀瑩骞嗛埀顒併亜韫囨挾澧曠紒鐘虫皑閹茬顭ㄩ崼鐔蜂簵婵犻潧鍊搁幉锟犳偂濞戙垺鍊堕柣鎰版涧娴滃墽绱掗埀顒佸緞瀹€鈧壕濂告煟濡櫣锛嶉柕鍡樺浮閺屽秷顧侀柛鎾卞妿缁辩偤宕卞Ο纰辨锤闂佸搫绋侀崢鑲╁婵犳碍鐓欓柟瑙勫姦閸ゆ瑩鏌涢幇銊ヤ壕濠碉紕鍋戦崐鏍箰妤ｅ啫绐楅幖娣灮椤╁弶淇婇妶鍌氫壕闂佸疇顫夐崹鍧楀箖濞嗘挸绾ч柟瀵稿С濡楁捇姊绘担铏广€婇柡鍛洴瀹曨垶寮堕幋鐘虫闂佺鎻粻鎴犵不婵犳碍鍋ｉ柛銉簻閻ㄧ儤銇勮熁閸曨厾鐦堥梺闈涢獜缁插墽娑垫ィ鍐╃叆闁哄浂浜炵粙鑽ょ磼閺冨倸鏋涚€殿喗鎸虫慨鈧柍閿亾闁归绮换娑㈠箻閺夋垹鍔伴梺绋款儐閹瑰洭寮诲鍫闂佸憡鎸婚惄顖氱暦閹存績妲堥柕蹇娾偓铏吅婵＄偑鍊栭悧妤冪矙閹烘垟鏋嶉柣妯肩帛閸婄敻鏌ｉ姀銏℃毄闁靛棗锕弻娑氣偓锝庡亝鐏忕敻鏌熼崣澶嬪唉鐎规洜鍠栭、妤呭磼閿旀儳鑰块梻鍌氬€风粈渚€骞夐敓鐘偓鍐幢濡偐顔曟繝鐢靛Т濞诧箓宕戝Ο姹囦簻闁哄倹瀵ч～宥夋煟閺冨倸甯剁紒鈧崒鐐寸厽闁规崘娅曢幑锝囨喐閻楀牊灏︽慨濠勭帛閹峰懘鎸婃径澶嬬潖闂備礁鍟块崲鏌ユ偋閹惧磭鏆︽繝濠傚暊濡插牓鏌曡箛鏇炐㈤柛銈嗗灴濮婃椽鏌呴悙鑼跺濠⒀冪摠閹便劍绻濋崒銈囧悑閻庤娲樼敮鎺楀煝鎼淬劌绠ｆい鎾跺晿濠婂嫮绡€闁汇垽娼цⅴ闂佺顑嗛幑鍥ь潖濞差亶鏁嗛柍褜鍓涚划鏃堟偨缁嬭法鐣鹃梺缁樺姇閹碱偆绮荤憴鍕闁挎繂楠告晶顔尖攽闄囬崑鎰閹烘绠涙い鎾楀嫮鏉归梻浣告惈婢跺洭鍩€椤掍礁澧柛姘儔楠炴牜鍒掗崗澶婁壕闁肩⒈鍓氶弲濂告⒒閸屾瑧鍔嶆俊鐐叉健瀹曘垽鎮￠獮顒佺☉閳规垹鈧綆浜為悾鍝勨攽鎺抽崐鏇㈠箠韫囨稑鐤鹃柡灞诲劚缁犲湱绱掗鐓庡辅闁稿鎹囬幊鐘活敆娴ｅ摜妯嗘繝鐢靛Х閺佹悂宕戝☉銏″仱闁靛ě鍐ㄧ亰閻庡箍鍎卞ú銈夊垂濠靛鐓欓柟瑙勫姦閸ゆ瑩鏌﹂崘顏勬灈闁哄矉缍佸顒勫垂椤旇棄鈧垶姊洪幖鐐测偓鏇㈩敄閸℃稑桅闁告洦鍨扮粻鎶芥煕閳╁啨浠﹀瑙勬礀閳规垿鎮╁▓鎸庢瘜闂侀€炲苯澧查悘蹇旂懇閹苯鈻庨幘瀵稿幐闁诲繒鍋涙晶钘壝洪弶鎴旀斀闁炽儱纾崺锝団偓瑙勬礀瀹曨剝鐏掔紒鐐妞村憡鏅ラ梻鍌氬€搁崐椋庣矆娓氣偓楠炴牠顢曢敂钘夊壒婵犮垼娉涢張顒€鐣烽崣澶岀瘈闂傚牊绋掗ˉ鐘绘煛閸☆厾鐣甸柡灞剧洴椤㈡洟鏁愰崱娆樻К闂佸摜鍎愰崹璺侯潖濞差亝顥堟繛鎴濈－绾偓闂備胶顭堥張顒傚垝瀹ュ鏅煫鍥ㄧ⊕閳锋帡鏌涚仦鎹愬闁逞屽墰閸忔﹢骞冮悙鐑樻櫆闁伙絽鐬奸鏇熺節閻㈤潧孝婵炲眰鍊楃槐鎺楀煛閸涱喒鎷哄銈嗗坊閸嬫挾绱掓径瀣唉鐎规洖缍婂畷鎺楁倷鐎电骞堥柣鐔哥矊闁帮綁濡撮崘顔煎窛閻庢稒锚閻濇棃姊虹紒妯荤叆闁硅姤绮庣划缁樸偅閸愨晝鍘甸柣搴ｆ暩椤牓鍩€椤掍礁鐏ユい顐ｇ箞椤㈡牠鍩＄€ｎ剛袦閻庤娲栭妶鎼佸箖閵忋垻鐭欓柛顭戝枙缁辩喎鈹戦悩鑼闁哄绨遍崑鎾诲箛閺夎法锛涢梺鐟板⒔缁垶鎮￠悢闀愮箚闁靛牆鍊告禍鎯р攽閳藉棗浜濋柣鐔濆洤鐒垫い鎺戝濞懷囨煏閸喐鍊愰柣娑卞櫍瀹曞爼顢楁担闀愮綍闂備礁澹婇崑鍛枈瀹ュ洠鍋撳鍐蹭汗缂佽鲸鎹囧畷鎺戭潩椤戣棄浜鹃柣鎴ｅГ閸婂潡鏌ㄩ弴鐐测偓褰掑疾椤忓棛纾介柛灞剧懅閸斿秵銇勯妸銉︻棤闁轰緡鍣ｉ幃娆撳垂椤愵偅缍楅梻浣告贡閸嬫捇宕滃璺鸿Е閻庯綆鍠楅悡鏇熺節婵犲倸鏆欓柡鍡愬灲閺屾稑顫濋悡搴濆枈闂佽鍠楅〃鍛村煝閹捐鍨傛い鏃傛櫕娴犲本淇婇悙顏勨偓鏍р枖閿曞倸鐐婄憸蹇涘矗閳ь剙鈹戦悩顔肩伇婵炲鐩垾锕傤敆閳ь剟鈥﹂崶顒€鐓涢柛娑卞枤閸欏棗鈹戦悩缁樻锭婵☆偅鐟╁畷宕囩矙濞嗗墽鍞甸柣鐔哥懃鐎氼厾绮堢€ｎ偅鍙忓┑鐘插暞閵囨繃顨ラ悙鏉戝闁诡垱妫冮弫鎰板炊閳哄倹顔撳┑鐘茬棄閺夊簱鍋撳Δ浣瑰弿闁圭虎鍠栫粻鐔兼煥濞戞ê顏柣顓烆槺閳ь剙绠嶉崕閬嶅箠婢舵劕缁╁ù鐘差儐閸婄敻鏌ㄥ┑鍡涱€楀ù婊勭矒閺屽秷顧侀柛鎾寸懇閹儲绺介崨濠備簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箰椤╊剚銇勯敂鍝勫婵﹥妞藉畷顐﹀礋椤掑顥旈梻浣告惈閹冲繒鎹㈤崟顐嬶綁骞囬弶璺唺闂佽鍎抽顓犵矓閸洘鈷戦梻鍫熶緱閻掗箖鏌涙惔銏犫枙闁诡喚鍏橀獮鎾诲箳閸℃ɑ鏉搁梻浣虹帛閸旀瑥顭囪閺侇噣宕滄担铏癸紲缂傚倷鐒﹂妴鐐哄箣閻愮鏀虫繝鐢靛Т濞层倗绮婚悷鎳婂綊鏁愰崼顐ｇ秷濠电偛鎳庡ú顓烆潖濞差亝鐒婚柣鎰蔼鐎氭澘顭胯濠㈡﹢鈥︾捄銊﹀枂闁告洦鍓涢ˇ鏉课旈悩闈涗粶闂佸府缍侀獮濠囨倷閸濆嫀銊╂煏婢跺牆鐏╁ù婊堢畺閺岋綁濮€閻樺啿鏆堥梺绋款儌閸撴繄鎹㈠☉銏犲耿婵°倕鍟伴鍥ь渻閵堝懏绂嬪ù婊呭仧濡叉劙骞掑Δ鈧悞鍨亜閹烘垵顏╃紒鈧崘鈹夸簻闁哄啫娲﹂ˉ澶娒归悩鍙夋儓妞ゎ亜鍟存俊鍫曞幢濞嗗浚娼风紓鍌欑椤戝棝宕归悽鍛婄畳婵＄偑鍊栧ú宥夊磻閹剧粯鐓涢悘鐐插⒔濞叉挳鏌涢埡鍐ㄤ槐鐎规洖缍婇、娆撳矗閵壯勶紡闂傚倸鍊峰ù鍥敋閺嶎厼鍨傞柛妤冨€ｅ☉銏犵闁宠　鍋撶紒璇叉閺岀喖姊荤€靛壊妲柛鐑嗗灦閹嘲顭ㄩ崟顓犵厜閻庤娲忛崕闈涚暦閵娾晩鏁婇柤濮愬€楅悾楣冩⒒娴ｈ櫣甯涢柛鏃撻檮缁傚秴顭ㄩ崼婵堝姦濡炪倖甯婇懗鑸垫櫠閸偒娈介柣鎰綑婵牓鏌曢崼顒傜М鐎规洘锕㈡俊姝岊槼闁绘帞鍋撶换婵堝枈濡椿娼戦梺鍓茬厛閸ㄦ娊骞忛崘顔芥櫇闁稿本绋戞禍妤呮⒑闂堟侗妲撮柡鍛矒閹繝寮撮悢缈犵盎闂佽澹嬮弲娑㈠焵椤掍焦绀嬬€殿喗濞婇弻鍡楊吋閸℃瑥骞嶅┑锛勫仜椤戝懎霉妞嬪孩鏆滄繛鎴炴皑绾捐偐绱撴担璇＄劷闁愁垱娲樼换娑㈡偂鎼达絿顔掗悗瑙勬礃缁繘藝閺屻儲鐓曢柍杞拌兌閻掑憡鎱ㄦ繝鍛仩婵炴垹鏁诲畷顏呮媴閸涘﹦鏉虹紓鍌氬€烽懗鍓佸垝椤栨粍宕查柛顐犲劜閸嬫ɑ銇勯弴妤€浜鹃悗瑙勬礀瀹曨剟鍩ユ径濠庢建闁逞屽墴瀹曨剟宕奸弴鐔叉嫼闂傚倸鐗婃笟妤€顬婅閳规垿鍨鹃搹顐㈡灎閻庤娲忛崹浠嬪箰婵犲啫绶為柛鈩兩戦弶鎼佹⒑閸︻厼鍔嬪┑鐐诧工閻ｇ兘骞囬弶璺啋缂傚倷鐒﹂敋婵炲牊鍨垮娲礈閹绘帊绨煎┑鐐插级閿曘垹鐣烽弴鐐嶆棃宕ㄩ鎯у箥闂備胶绮崹鎯版懌闂佺粯鎸婚惄顖炲蓟濞戞埃鍋撻敐搴′簼閻忓繒鏁婚弻鐔煎矗婢跺鍞夐悗瑙勬礈閸犳牠銆佸Δ鍛＜闁靛牆鏌婇悙鐢电＝闁稿本鑹鹃埀顒勵棑濞嗐垽鏁撻悩鑼崶闂佸搫绋侀崢浠嬪磿濡ゅ懏鐓曠€光偓閳ь剟宕戝☉銏犲強闁靛鏅滈悡蹇涚叓閸パ嶅伐濠⒀勭叀閺屾稒鎯旈敐鍛亪闂佸搫鏈ú妯兼崲濞戙垹鍨傛い鏃傚帶琚樺┑锛勫亼閸婃牕顫忛崷顓熸殰闁圭儤銇涢埀顒佹瀹曟﹢顢欓崲澹洦鐓曢柍鈺佸暟閹冲啯銇勯搴″枤濞撳鏌曢崼婵嗘殭濠碘€炽偢閺岀喖宕橀懠顒傤唺缂備緡鍠栭鍛搭敇婵傜骞㈤柟閭﹀厸缁ㄥジ姊绘担鍛婂暈闁告柨绻樺鎻掆攽鐎ｎ亜鍋嶉梺褰掓？閻掞箓鍩涢幋锔界厱婵炴垶锕銉モ攽椤旂厧鈧潡寮诲☉銏犳闁割煈鍣崝澶愭⒑閸濆嫭鍣归柣鏍帶椤曪綁骞橀钘変汗闂佹眹鍨婚。顔炬閺屻儲鈷掑〒姘ｅ亾闁逞屽墰閸嬫盯鎳熼娑欐珷閻庣數纭堕崑鎾舵喆閸曨剛顦ㄩ梺鎸庢磸閸ㄨ棄鐣峰ú顏呭€烽柡澶嬪灩缁愮偤姊洪崨濠勭細闁稿骸鍟块埢鏃堝锤濡や讲鎷婚梺绋挎湰閻熝囁囬敃鍌涚厵缁炬澘宕禍鎵偓瑙勬处閸ㄥ爼銆侀弴銏犵厱婵﹩鍘介妵婵嬫煛娴ｇ鏆ｇ€规洘鍨块幃鐑芥焽閿斿彨褔鎮楅崹顐ｇ凡閻庢矮鍗抽悰顕€宕堕澶嬫櫍闂佺粯蓱瑜板啰绮诲ú顏呪拺闁煎鍊曢弸鎴犵磼椤旇偐鐏辩紒顔芥瀹曞ジ寮撮悙闈涘Е婵＄偑鍊栫敮濠勭矆娓氣偓瀹曠敻顢楅崟顒傚幈濠殿喗銇涢崑鎾剁磼閻樺磭澧甸柣?${selectedDetail.id}`,
      () => adapter.updateDesignSpatialObject(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳牠鈥﹂悜钘夋瀬闁归偊鍘肩欢鐐测攽閻樻彃顏撮柛鐔奉儔濮婄粯鎷呴悷鏉垮Б濠电偛鐡ㄥ畝绋跨暦閹达箑宸濇い鎾跺У濞堥箖姊洪崨濠傚婵☆垰锕ら妴鎺撶節濮橆厾鍘梺鍓插亝缁诲啴藟閻愮儤鐓熼柟鎯у船閸旀粓鏌曢崶褍顏柡浣稿暣瀹曟帒鈽夊▎鎾存殬濠碉紕鍋戦崐銈夊磻閸曨厽宕查柟杈剧畱鍥撮梺鎸庢⒒閸嬫捇宕幋锔界厪闁割偅绻傞顏堟煟椤愩垻绠绘慨濠勭帛閹峰懘宕ㄦ繝鍛攨闂備胶顭堢花娲磹濠靛棛鏆︾憸鐗堝笒缁狀噣鏌﹀Ο渚Ш闁绘稏鍎茬换婵嬫偨闂堟刀銏＄箾鐠囇呯暤闁糕晜鐩獮瀣晜閻ｅ苯骞堟繝鐢靛仦閸ㄥ爼鏁冮锕€缁╁┑鐘崇閸婂爼鐓崶褔顎楃€规挸妫濋弻鈥崇暆鐎ｎ剛袦闂佺硶鏂侀崜婵堟崲濠靛纾兼繝濞惧亾闁告繃顨婂缁樻媴妞嬪簼瑕嗙紓浣瑰絻濞尖€崇暦濡も偓铻ｇ紓浣姑鍧楁⒑闁偛鑻晶鎾煛鐏炵偓绀嬬€规洜鍘ч埞鎴﹀幢閳轰礁唯闂傚倷绀侀幖顐﹀箠韫囨洘宕查柛顐ｇ箥濞兼牗绻涘顔荤盎缂佺姳鍗抽獮鏍ㄦ綇閸撗勫仹闂佷紮缍佸褔鍩為幋锔藉€烽柤纰卞墯閸曢箖姊洪崨濠冣拹闁搞劌娼￠悰顕€宕卞Ο鑲╂嚌闂侀€炲苯澧柣锝囧厴閹剝鎯斿Ο缁樻澑闂備礁鎲￠崝蹇涘疾濠婂牆绾ч柟闂寸劍閳锋帒霉閿濆牊顏犻悽顖涚洴閺屾盯寮埀顒勨€﹂崶銊ь洸缂佸绨遍弸搴ㄦ煙闁箑骞楅柣婵堝厴濮婃椽宕崟顒€鍋嶉梺鎼炲妽濡炰粙骞冮敓鐘冲亜闁兼祴鏅涜ぐ鍕⒑閹肩偛鍔橀柛鏂跨Ч閸╂盯骞掗弮鍌滐紲闂佺粯锕㈠褎绂掗柆宥嗙厸鐎光偓閳ь剟宕伴弽顓溾偓浣糕枎閹捐櫕顥濋梺闈涚墕閻楀啴宕戦幘璇查敜婵°倓鑳堕崢闈涱渻閵堝棙顥嗘い顐㈩槸閳诲秹宕堕埡鍐紲闁哄鐗勯崝宀€绮幒妤佹嚉闁挎繂顦伴悡鐔兼煙閻愵剙鈻曟い搴㈩殔閳规垿鍨鹃搹顐㈡灎濠殿喖锕ら…宄扮暦閹烘垟鏋庨柟鎼幗琚︽繝鐢靛О閸ㄥ骞婇幘缁樻櫇妞ゅ繐瀚弳锕傛煙鏉堝墽鐣辨鐐灪缁绘盯骞嬮悜鍡欏姺闂佺粯绋忛崕闈涱潖濞差亜鎹舵い鎾跺剱閺嗩厼鈹戦悩顔肩仾妞ゎ厼娲︾粩鐔煎即鎺虫禍褰掓煙閻戞ɑ灏甸柛妯兼暬濮婄粯绗熼崶褍浼庣紓浣哄У閸ㄥ灝顕ｉ幖浣哥缂備焦顭囬崢閬嶆煟鎼搭垳绉甸柛瀣噽娴滄悂顢橀姀锛勫帗缂傚倷鐒﹁摫鐎规洖鐬奸埀顒冾潐濞叉牜绱炴繝鍥モ偓浣糕枎閹炬潙浠奸柣蹇曞仜閵堟悂宕戝Δ浣虹瘈缁炬澘顦辩壕鍧楁煕鐎ｎ偄鐏寸€规洘鍔欐俊鑸靛緞婵犲倸浜跺┑掳鍊х徊浠嬪疮椤愩倗鐭嗛柛灞剧⊕閸欏繑淇婇悙棰濆殭濞存粓绠栧铏圭磼濡湱绻侀梺闈╃秶缁蹭粙鎮惧畡閭︽建闁逞屽墴閵嗕礁鈻庨幋婵囩€抽柡澶婄墑閸斿海绮旈柆宥嗏拻闁稿本鐟х粣鏃€绻涙担鍐叉处閸嬪鏌涢埄鍐︿簵婵炴垶顭傞弮鍫濆窛妞ゆ挾濮存慨锔戒繆閻愵亜鈧牜鏁幒妤€纾归柤濮愬€栭弳婊勭箾閹寸偑鈧帗鎯旈妸銉у€為悷婊勭箞閻擃剟顢楁担鍏哥盎闂侀潧楠忕槐鏇㈠煡婢跺浜滄い鎾寸矊婵倻鈧娲橀敃銏′繆閹间礁唯妞ゆ棃鏁崑鎾绘焼瀹ュ棌鎷婚梺绋挎湰閻燂妇绮婇悧鍫涗簻闁哄洤妫楅幊澶愬磻閹捐鍨傛い鎰╁灪鐠囩偤鎮楃憴鍕┛缂傚秳绀侀悾宄邦潨閳ь剟鍨鹃敃鍌氱闁绘劗鏁搁埢澶岀磽閸屾艾鈧悂宕愰悜鑺ュ€块柨鏇氱劍閹冲苯鈹戦悩鎰佸晱闁搞劑浜堕獮鎰板箮閽樺鎽曞┑鐐村灦鑿ゆ俊鎻掔墛閹便劌螖閳ь剟鎮ч崱妯侯嚤闁规壆澧楅埛鎴︽煕濠靛棗顏い銉︾矒閺岋絽螖閳ь剙螞濠靛鏄ラ柣鎰惈缁狅綁鏌ㄩ弮鍥棄闁逞屽墮閸㈣尪鐏嬮梺缁橆殔閻楀繒绮婚幘瀵哥闁割偆鍠撶粻妯肩磼鏉堛劍灏伴柟宄版嚇瀹曨偊宕熼幋顖滅М闁哄瞼鍠栧畷銊︾節閸愩劉鍋撻幇鐗堢厵妞ゆ洍鍋撶紒鐘崇墵楠炲啫顭ㄩ崼鐔风檮婵犮垼娉涢惌鍫ュ触閸涘瓨鈷掑ù锝囨嚀椤曟粍绻涢幓鎺斝х€规洘鍨块獮姗€宕滄担鐚寸床闂備線鈧偛鑻晶浼存煃瑜滈崜銊х礊閸℃稑纾诲ù锝呮贡椤╁弶绻濇繝鍌滃闁绘挻鐩弻娑㈠Ψ閵忊剝鐝旀繛瀵稿缁犳捇寮诲☉銏℃櫜闁搞儜鍐瀱缂傚倷鑳剁划顖滄崲閸喐鍙忛柍褜鍓熼弻宥夊煛娴ｅ憡娈紒鐐劤閸熷潡鍩為幋锔绘晩缁绢厼鍢叉导鎰渻閵堝骸骞栭柛銏＄叀閹箖鎮滈挊澶岊唺闂佽鎯岄崢浠嬪磽闂堟侗娓婚柕鍫濇閻忚鲸淇婇銏狀仾缂佸倸绉甸妶锝夊礃閳哄啫骞嶉梻鍌氬€搁崐鎼侇敋椤撯懞鍥晜閸撗勶紡闂佸憡鎸嗛崟顐ｇ暚婵＄偑鍊ゆ禍婊堝疮娴兼潙鐒垫い鎺戯功缁夐潧霉濠婂嫮绠炴鐐村灴閺佹劖寰勭€ｎ剙骞楁俊鐐€栭幐楣冨磻閻愭牳澶婎煥閸喓鍘梺绯曞墲閿氱紒妤佸笚閵囧嫰顢曢敐鍥╃杽闂佽桨鐒﹂崝娆忕暦閵娾晩鏁嗛柍褜鍓熻棢婵﹩鍏橀弨浠嬪箳閹惰棄纾规俊銈勭劍閸欏繘鏌ｉ幋锝嗩棄缁惧墽绮换娑㈠箣閺冣偓閸ゅ秹鏌涢妷顔煎闁稿鍔庣槐鎺斺偓锝庡亜椤曟粓鏌ｆ惔顔煎⒋婵﹥妞介幃鐑藉级鎼存挻瀵栫紓鍌欑贰閸ｎ噣宕圭捄铏规殾闁硅揪绠戠粻娑㈡煟濡も偓閻楀繘宕㈤崡鐐╂斀闁绘劕寮堕ˉ婊勭箾鐎涙澹橀崡閬嶆煕閿旇骞楅柛瀣墵閺屻劌鈹戦崱鈺傂ч梺鎶芥敱鐢繝寮诲☉姘勃闁告挆鍕珮婵＄偑鍊х拋锝囩不閹捐钃熼柣鏃傚劋鐎氭氨鎲歌箛鏇炲К闁逞屽墴閹鎲撮崟顒傤槰缂備浇顕ч悧鎾愁嚕椤愶箑绀冩い鏃囧亹閿涙粌鈹戦绛嬬劸濞存粠鍓欓悾鐑藉醇閺囩啿鎷绘繛杈剧到閹诧繝骞嗛崼銏㈢＜閻庯絺鏅濈粣鏃傗偓瑙勬礃閸ㄥ灝鐣烽悢纰辨晬闁逞屽墯瀵板嫭绻濇惔銏犲厞婵＄偑鍊栭崹鍏兼叏閵堝妫橀柍褜鍓熷缁樻媴閾忕懓绗￠梺鎸庢皑閻ヮ亞绱掗姀鐘茬睄闂侀潧妫楅崐鍨嚕婵犳艾唯闁挎梹鍎抽獮妤呮⒒娴ｇ瓔娼愰柛搴㈠▕椤㈡岸顢橀姀鐘电枃闂佹悶鍎洪崜姘舵偂濞戞埃鍋撻崗澶婁壕闂侀€炲苯澧寸€规洑鍗冲浠嬵敇濠ф儳浜惧ù锝囩《濡插牓鏌曡箛鏇炐㈤柤鏉跨仢閳规垶骞婇柛濠冨姍瀹曟垿骞樼紒妯煎幐闁诲函绲婚崝宀勫焵椤掍胶绠炵€殿喖顭烽弫鎾绘偐閹绘帟鈧潡姊鸿ぐ鎺戜喊闁告挻绋掔€靛ジ宕熼鐘碉紳婵炶揪绲肩划娆撳传濞差亝鍋ㄦい鏍ュ€楃弧鈧梺缁樹緱閸ｏ絽鐣烽崡鐑嗘僵闁稿繐銇欓埡鍐＝闁稿本鑹鹃埀顒€鎽滅划鏃堟偨閸涘﹤浜卞┑鐘诧工閹冲繘锝為弴銏＄厵闁绘垶锕╁▓銏ゆ煛娴ｉ潻韬柡宀嬬秮閺佹劙宕ㄩ鑺ュ闂備線娼荤徊濂稿础閹惰棄绠栨俊銈傚亾闁崇粯鎹囧畷褰掝敊閻ｅ奔绮氬┑锛勫亼閸婃牕鈻旈敃鍌氱倞鐟滃繘宕ｉ埀顒€鈹戦悩顔肩伇婵炲鐩垾锕傤敆閳ь剟鈥﹂崶顒€鐓涢柛灞久肩花濠氭⒑鐟欏嫭绶插褍閰ｅ畷姘跺级鎼存挻鏂€濡炪倖鐗楅悷銉ョ暤閸℃ɑ鍙忓┑鐘插鐢盯鏌熷畡鐗堝殗鐎规洏鍔嶇换婵嬪磼濞戞瑧鏆梻鍌氬€风粈浣革耿闁秮鈧箓宕煎顏呯☉閳规垿宕卞▎鎰啎闂備胶绮濠氬煕閸儱鏋侀柛鎰靛枟閻撱儲绻濋棃娑欘棡闁瑰吋鍔欓弻锕傚磼濮樼厧鍓伴梺瀹狀潐閸ㄥ潡骞冮埡浣叉灁闁圭瀛╅鍥╃磽閸屾瑦绁板瀵割焾鐓ら柣鏃堫棑閺嗭箓鏌熸潏鍓х暠缂佺媴缍侀弻銊╁即濡も偓娴滃墽绱掗悙顒€鍔ゆ繝鈧柆宥呯疅婵繂鐬奸悿鈧┑鐐村灦椤洭顢欓崱娑欑厽閹兼惌鍨崇粔鐢告煕閻樻剚娈滅€殿喗鐓″濠氬Ψ閿旀儳骞堥梻渚€娼чˇ顓㈠垂閸濆嫧鏋嶉柛鎰典簽绾惧吋淇婇妶鍌氫壕濡炪倧绠撳褔锝炶箛娑欐優閻熸瑥瀚弸鍌炴⒑閸涘﹥澶勯柛瀣钘濋柕濞垮労濞撳鏌曢崼婵囶棡闁艰尙濞€閺屾盯濡烽敐鍛瀳闂佺粯绻冨Λ鍐潖閾忓湱纾兼俊顖濆吹閸欏棝姊洪崨濠呭妞ゆ垵顦甸獮鍐晸閻樺弬銊╂煃閸濆嫬鈧宕㈡禒瀣拺闁告繂瀚埀顒€婀遍埀顒傜懗閸パ呯暰闂佸壊鍋€閹冲洭宕戦幘鏂ユ婵炲棙鍨归悿鍕攽椤旂》鍔熺紒顕呭灦楠炲繘宕ㄩ婊呯厯闂佸吋鍓氶崹浼存偂濡崵绡€闁汇垽娼ф禒鈺傘亜閺囩喓鐭岀紒顔碱煼楠炴绱欓悩鐢电暰闂備焦鐪归崹濠氣€﹂崼銏㈢焼閻庯綆鍋佹禍婊堟煛瀹ュ啫濡介柣銊﹀灴閺岋綁濡堕崒姘闂傚倸鍊搁崐椋庣矆娓氣偓閹潡宕惰濞存牠鏌曟繛鐐珕闁搞倕瀚伴弻銈夊传閵夛附姣勫銈傛櫇閸忔﹢寮婚敐澶婄闁告劘灏欏Σ鏉库攽閻愬瓨灏い顓犲厴瀵寮撮姀鐘诲敹濠电娀娼ч鎰板焵椤掍緡娈旈棁澶嬬節婵犲倸顏╁┑顔肩Ч閺屸€崇暆鐎ｎ剛鐦堥悗瑙勬磸閸旀垿銆佸▎鎾村€锋い鎺嗗亾闁搞劑浜跺缁樻媴閸濆嫪缂撻梺绋垮瑜板啳鐏嬮梺鍛婂姂閸斿酣寮抽敂鑺ュ弿婵＄偠顕ф禍鎯ь渻閵堝啫鐏柣鐔叉櫅閻ｇ兘宕ｆ径宀€褰惧銈嗙墬绾板秹骞栭幇顔剧＜闁绘灏欑粔娲煙椤旂瓔娈旈柍钘夘槸閳诲骸螣閻撳骸楔缂傚倸鍊烽懗鑸垫叏閻㈠憡鏅濋柕蹇嬪€曢拑鐔兼煥濠靛棭妲搁柣鎾寸☉閵嗘帒顫濋敐鍛闂備礁鎲￠悷銉р偓姘煎弮楠炲牓濡搁敂鍓х槇闂佸憡鍔忛弬鍌涚閵忋倖鍊甸悷娆忓婢跺嫰鏌涚€ｎ亷鏀诲ǎ鍥э躬閹粓鎸婃竟鈹垮姂閺屻劑寮崼鐔告闂佺顑嗛幐濠氬Χ閿濆绀冮柍鍦亾鐎氬ジ姊绘担钘夊惞闁哥姵鎸婚弲璺何旈崨顓犳焾闂佺粯鍔栫粊鎾绩娴犲鐓熼柟閭﹀灱閸ゅ妫呴澶婂⒋闁哄瞼鍠栭、娆戞嫚閹绘帞銈俊鐐€戦崹鍝勭暆閹间礁鏄ラ柍褜鍓氶妵鍕箳閹存繍浼€閻庤鎸风欢姘跺蓟濞戙垹唯妞ゆ梻鍘ч埛鎺楁⒑鏉炴壆顦︽繛宸弮瀵鏁愰崨鍌滃枛瀹曟宕楅崗鑲╂濠电姷顣介崜婵娿亹閸愵煁娲敇閻戝棙缍庣紓鍌欑劍钃卞┑顖涙尦閺屾稑鈽夊鍫濅紣闂佸搫妫楅悧鎾愁潖濞差亜宸濆┑鐘插枤濡牠姊婚崒姘仼閻庢凹鍠氶崚鎺斺偓锝庝憾閸氬顭跨捄渚剰闁逞屽墰閸忔ê螞閸涙惌鏁嗛柛鎰╁妿婢跺嫬鈹?${payload.name}`, () => adapter.createDesignSpatialObject(payload));
  }

  resetDesignSpatialForm();
}

async function handleTerrainSubmit(event) {
  event.preventDefault();
  const name = elements.terrainName.value.trim();
  if (!name) {
    logAction("Terrain save failed: name is required");
    renderLog();
    return;
  }

  const payload = {
    name,
    terrainType: elements.terrainType.value.trim() || "site",
    coordSystem: elements.terrainCoordSystem.value,
    bboxMinX: parseOptionalNumber(elements.terrainBboxMinX.value),
    bboxMinY: parseOptionalNumber(elements.terrainBboxMinY.value),
    bboxMinZ: parseOptionalNumber(elements.terrainBboxMinZ.value),
    bboxMaxX: parseOptionalNumber(elements.terrainBboxMaxX.value),
    bboxMaxY: parseOptionalNumber(elements.terrainBboxMaxY.value),
    bboxMaxZ: parseOptionalNumber(elements.terrainBboxMaxZ.value),
    heightmapRef: elements.terrainHeightmapRef.value.trim(),
    meshRef: elements.terrainMeshRef.value.trim(),
    textureRef: elements.terrainTextureRef.value.trim(),
    source: elements.terrainSource.value.trim() || "manual",
    resolution: elements.terrainResolution.value.trim(),
    notes: elements.terrainNotes.value.trim(),
  };

  if (selectedDetail && selectedDetail.kind === "terrain") {
    await runAction(
      `Update terrain ${selectedDetail.id}`, 
      () => adapter.updateTerrainRawObject(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(`Create terrain ${payload.name}`, () => adapter.createTerrainRawObject(payload));
  }

  resetTerrainForm();
}

function loadSelectedWorkAreaIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "workArea") {
    logAction("Load failed: select a work area first");
    renderLog();
    return;
  }
  elements.workAreaName.value = record.name;
  elements.workAreaType.value = record.type;
  elements.workAreaSubtype.value = record.workAreaSubtype || "";
  elements.workAreaOwner.value = record.owner || "";
  elements.workAreaPlanned.value = String(Math.round((record.plannedProgress || 0) * 100));
  elements.workAreaActual.value = String(Math.round((record.actualProgress || 0) * 100));
  elements.workAreaDescription.value = record.description || "";
}

function loadSelectedQuantityIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "quantity") {
    logAction("Load failed: select a quantity first");
    renderLog();
    return;
  }
  elements.quantityWorkArea.value = record.workAreaId;
  elements.quantityItemName.value = record.itemName;
  elements.quantityItemCode.value = record.itemCode || "";
  elements.quantityCategory.value = record.category || "";
  elements.quantityUnit.value = record.unit || "m3";
  elements.quantityPlanned.value = String(record.plannedQuantity ?? 0);
  elements.quantityActual.value = String(record.actualQuantity ?? 0);
  elements.quantityNotes.value = record.notes || "";
}

function loadSelectedDesignQuantityIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "designQuantity") {
    logAction("Load failed: select a design quantity first");
    renderLog();
    return;
  }
  elements.designQuantityWorkArea.value = record.workAreaId;
  elements.designQuantityItemName.value = record.itemName;
  elements.designQuantityItemCode.value = record.itemCode || "";
  elements.designQuantityCategory.value = record.category || "";
  elements.designQuantityUnit.value = record.unit || "m3";
  elements.designQuantityTarget.value = String(record.targetQuantity ?? 0);
  elements.designQuantityVersion.value = record.designVersion || "";
  elements.designQuantityNotes.value = record.notes || "";
}

function loadSelectedResourceLogIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "resourceLog") {
    logAction("Load failed: select a resource log first");
    renderLog();
    return;
  }
  elements.resourceWorkArea.value = record.workAreaId;
  elements.resourceType.value = record.resourceType || "labor";
  elements.resourceCategory.value = record.resourceCategory || record.resourceType || "labor";
  elements.resourceSubtype.value = record.resourceSubtype || "";
  elements.resourceName.value = record.resourceName || "";
  elements.resourceQuantity.value = String(record.quantity ?? 0);
  elements.resourceUnit.value = record.unit || "";
  elements.resourceDay.value = String(record.recordDay ?? state.currentDay);
  elements.resourceTeamName.value = record.teamName || "";
  elements.resourceSpecification.value = record.specification || "";
  elements.resourceSourceType.value = record.sourceType || "manual";
  elements.resourceSupplier.value = record.supplier || "";
  elements.resourceNotes.value = record.notes || "";
}

function loadSelectedDesignSpatialIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "designSpatial") {
    logAction("Load failed: select a design spatial record first");
    renderLog();
    return;
  }
  elements.designSpatialWorkArea.value = record.workAreaId;
  elements.designSpatialName.value = record.name || "";
  elements.designSpatialType.value = record.designType || "alignment";
  elements.designSpatialCoordSystem.value = record.coordSystem || "local";
  elements.designSpatialStationStart.value = formatOptionalInput(record.stationStart);
  elements.designSpatialStationEnd.value = formatOptionalInput(record.stationEnd);
  elements.designSpatialBboxMinX.value = formatOptionalInput(record.bboxMinX);
  elements.designSpatialBboxMinY.value = formatOptionalInput(record.bboxMinY);
  elements.designSpatialBboxMinZ.value = formatOptionalInput(record.bboxMinZ);
  elements.designSpatialBboxMaxX.value = formatOptionalInput(record.bboxMaxX);
  elements.designSpatialBboxMaxY.value = formatOptionalInput(record.bboxMaxY);
  elements.designSpatialBboxMaxZ.value = formatOptionalInput(record.bboxMaxZ);
  elements.designSpatialElevationTarget.value = formatOptionalInput(record.elevationTarget);
  elements.designSpatialVersion.value = record.designVersion || "";
  elements.designSpatialRef.value = record.designRef || "";
  elements.designSpatialNotes.value = record.notes || "";
}

function loadSelectedTerrainIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "terrain") {
    logAction("Spatial save failed: geometry type and target are required");
    renderLog();
    return;
  }
  elements.terrainName.value = record.name || "";
  elements.terrainType.value = record.terrainType || "site";
  elements.terrainCoordSystem.value = record.coordSystem || "local";
  elements.terrainBboxMinX.value = formatOptionalInput(record.bboxMinX);
  elements.terrainBboxMinY.value = formatOptionalInput(record.bboxMinY);
  elements.terrainBboxMinZ.value = formatOptionalInput(record.bboxMinZ);
  elements.terrainBboxMaxX.value = formatOptionalInput(record.bboxMaxX);
  elements.terrainBboxMaxY.value = formatOptionalInput(record.bboxMaxY);
  elements.terrainBboxMaxZ.value = formatOptionalInput(record.bboxMaxZ);
  elements.terrainHeightmapRef.value = record.heightmapRef || "";
  elements.terrainMeshRef.value = record.meshRef || "";
  elements.terrainTextureRef.value = record.textureRef || "";
  elements.terrainSource.value = record.source || "manual";
  elements.terrainResolution.value = record.resolution || "";
  elements.terrainNotes.value = record.notes || "";
}

async function handleTaskListClick(event) {
  const actionButton = event.target.closest("[data-task-action]");
  if (actionButton) {
    event.stopPropagation();
    const taskId = actionButton.dataset.taskId;
    const payload = taskPayloadForAction(actionButton.dataset.taskAction);
    if (payload) {
      await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦︾紓宥咃躬瀵劑鏌嗗鍛€柣鐘烘〃鐠€锕傛倿娴犲鍙撻柛銉ｅ妿閳藉鏌ｉ幘瀵告创闁哄本绋撴禒锕傚礈瑜滈弳锟犳⒑鐠囨煡鍙勭紒鐘崇墪椤繒绱掑Ο璇差€撻梺鍛婄☉閿曘儵宕曢幘鎰佹富闁靛牆绻愰惁婊堟煕閵娿儳鍩ｆ鐐插暙铻ｉ悶娑掑墲閺傗偓闂佽鍑界紞鍡樼濠靛洦缍囬柛顐犲劜閳锋垿鏌熺粙鎸庢崳缂佺姵鎸荤换娑㈡嚑椤掆偓閳诲牏鈧娲橀崹鍧楃嵁濮椻偓瀵剟濡烽敂鍙ョ按闂傚倷绀佹竟濠囨偂閸儱绐楁俊銈呮噺閸婂墎鈧箍鍎卞Λ娑氬姬閳ь剟姊哄Ч鍥х伈婵炰匠鍕浄婵犲﹤鐗婇悡銉╂煛閸ャ儱濡洪梺顓у灦閺岋絽鈽夐崡鐐寸彎閻庤娲橀敃銏ゃ€佸▎鎴濇瀳閺夊牄鍔庣粔閬嶆⒒閸屾瑧绐旀繛浣冲洦鍋嬮柛鈩冪☉缁犵娀鏌熸导鏉戜喊闁轰礁锕弻鐔煎箥椤旂⒈鏆梺鎶芥敱閸ㄥ湱妲愰幘瀛樺濠殿喗鍩堟禍婵嬪箞閵娾晛閱囨繝鍨姉閸炵敻姊洪懡銈呮灁濠⒀勵殜钘熼柕蹇嬪€栭悡娆愩亜閺嶃劏澹樻い蹇ｄ邯閺岀喖顢涘☉娆樻婵犵鍓濋幃鍌炲极閸屾粍鍠嗛柛鏇ㄥ亽娴兼粌鈹戦悩鍨毄闁稿濞€楠炴捇顢旈崱妤冪瓘闂佺鍕╀粶闁逞屽墾缁犳挸鐣锋總绋课ㄩ柕澶涚畳缁躲垽姊婚崒娆戣窗闁告挻鐟х划鏃堟偨閸涘﹤浜楀┑鐐叉閸ㄧ懓螞椤栫偞鐓涘璺猴功娴犮垽鏌ら崫銉﹀殌闂囧绻濇繝鍌氼仼妞ゃ儱顑夐弻宥堫檨闁告挻绻堥敐鐐村緞婵炴帗妞介弫鍐磼濮橆剛鈧參姊洪崜鎻掍簼婵炴彃绻橀崺鈧い鎴ｆ硶缁愭梻鈧鍠楅幐铏叏閳ь剟鏌嶉埡浣告殲闁绘繃鐗犲缁樼瑹閳ь剟鍩€椤掑倸浠滈柤娲诲灡閺呭墎鈧數纭堕崑鎾舵喆閸曨剛顦ㄩ柣銏╁灙閸撴繃绌辨繝鍥х濞达絽鎽滈崢鎼佹⒑缁嬫寧婀扮紒顔肩焸閻涱喖顓奸崶鈺冿紳闂佺鏈懝楣冨焵椤掑倸鍘存慨濠呮椤撳吋寰勬繝鍌溾偓顓㈡偡濠婂懎顣奸悽顖涘浮瀹曟瑩鎮╃紒妯煎幗闂佸搫鍊搁悘婵嬪箖閹达附鐓熼柟鎹愭硾閺嬫盯鏌″畝鈧崰鏍嵁閸℃凹妾ㄩ梺鎼炲€楅崰鏍蓟閻旂厧绀冮柟缁樺俯娴煎啴姊洪崫鍕拱婵炶尙鍠庨悾鐑藉箚闁附些婵＄偑鍊曞ù姘跺储妤ｅ啫鐒垫い鎺嶇贰閸熷繘鏌涢敐搴℃珝鐎规洘濞婇弫鎰板川椤栨稒顔曢梻浣筋嚃閸ㄥ爼宕戞繝鍋斤綁宕崟銊︽杸濡炪倖姊归娆忣焽閹邦厹浜滈柕濞垮劤婢с垺淇婇崣澶婂妤犵偞顭囬埀顒佺⊕閿氭い搴㈡崌濮婃椽宕ㄦ繝鍐ㄧ閻庢鍠涢崺鏍偤韫囨挴鏀介柣妯虹仛閺嗏晠鏌涚€ｎ偆娲存鐐茬箻楠炲鎮╅悽娈挎Ц濠电偞鎸婚崺鍐磻閹惧灈鍋撶憴鍕婵＄偘绮欏畷娲焵椤掍降浜滈柟鍝勭Ч濡惧嘲霉濠婂嫮鐭掗柡宀€鍠栭幃婊兾熼搹閫涙樊闂備礁鎼鍐磹閺嶎偅宕叉繛鎴欏灩缁€鍌炴煟閹炬娊顎楁い顐㈢Ф缁辨挻鎷呴搹鐟扮闂佺儵鏅╅崹浼存偩閻戣姤鏅查柛鈩冾殘缁愮偤鏌ｈ箛鏇炰哗鐞氭瑩鏌熼摎鍌氬祮婵﹦绮幏鍛驳鐎ｎ亝鐣伴梻浣告憸婵敻骞戦崶褏鏆﹂柡鍥ュ灪椤ュ牊绻涢幋鐐殿暡婵炲牊鍎抽埞鎴炲箠闁稿﹥娲熼獮濠呯疀濞戞鍘遍梺鍦劋椤ㄥ棝宕愰悽鍛娾拻闁割偆鍠撻埊鏇㈡煙閸欏鍊愰柡宀嬬秮閺佹劖寰勫畝鈧弳顐⑩攽椤旂》鍔熺紒顕呭灦楠炲繘宕ㄩ弶鎴滅炊闂侀潧顦介悘婵嬪Ω閵夈垺鏂€闂佸疇妫勫Λ妤佺椤栨稓绠惧璺侯儐缁€鍫ユ煕閹烘挸娴€规洖銈搁幃銏㈢矙濞嗛敮鍋撻幘缁樷拺闁告稑锕﹂埥澶愭煥閺囨ê鍔氶柍缁樻尰鐎佃偐鈧稒菤閹风粯绻涙潏鍓хК婵☆偄瀚板畷銉ㄣ亹閹烘挾鍘遍梺缁樏崯鎸庢叏婢舵劖鐓曢柟鐑樻尭缁楁帡鏌ｉ敐鍡欑疄闁糕斁鍋撳銈嗗笒鐎氼剛绮婚弻銉︾厪闊洦娲栭～宥夋煟閺冨倸鍔嬪┑顖濆亹閳ь剝顫夊ú鏍洪妸鈺傚仼濡わ絽鍟埛鎺懨归敐鍥剁劸妞ゃ儱绻橀弻娑氣偓锝庝簼閸ｅ綊鎮￠妶鍡樺弿婵＄偠顕ф禍楣冩⒑鐠団€虫珯缂佺粯绻冩穱濠囨倻閽樺鍘搁梺绋挎湰閸╁啴宕戦幘缁樺仺闁告稑锕﹂崣鍡椻攽閻樼粯娑ф俊顐ｎ殜閸┾偓妞ゆ帒鍊归崵鈧梺瀹狀嚙缁夌懓鐣烽崼鏇炵厸闁告劦浜风槐?${taskId}`, () => adapter.updateTask(taskId, payload), { kind: "task", id: taskId });
    }
    return;
  }

  const card = event.target.closest("[data-task-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "task", id: card.dataset.taskCard };
  await loadHistoryDetail("task", card.dataset.taskCard);
  renderTasks();
  renderDetailPanel();
}

async function handleIssueListClick(event) {
  const actionButton = event.target.closest("[data-issue-action]");
  if (actionButton) {
    event.stopPropagation();
    const issueId = actionButton.dataset.issueId;
    const payload = issuePayloadForAction(actionButton.dataset.issueAction);
    if (payload) {
      await runAction(`闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦﹂柟纰卞亞閹噣顢曢敃鈧粈澶屸偓鍏夊亾闁告洖澧庣粙蹇撯攽閻樼粯娑фい鎴濇噽缁濡烽妷鍐ㄧ秺閺佹劖寰勭€ｎ偆褰稿┑鐘灱椤煤閺嶎厼鐓橀柟杈鹃檮閸婄兘鏌ょ喊鍗炲妞わ絾妞藉铏规嫚閼碱剛顔夌紓浣筋嚙閻楀棝顢氶敐澶婄濞达綀顫夊▍鍥⒑缁嬫寧婀扮紒瀣崌瀹曘垽鏌嗗鍡忔嫼闂佸憡鍔曞鍫曞箚閸儲鐓曞┑鐘插鐢盯鏌￠崨顓犲煟妞ゃ垺妫冨畷銊╊敃閿涘嫮娉块梻鍌欑閹碱偄煤閿曞倹鏅梻浣告啞濡垶淇婇崶顒€鐒垫い鎺戝枤濞兼劖绻涢崣澶岀煉鐎规洑鍗冲浠嬵敇濠ф儳浜惧ù锝囩《濡插牊鎱ㄥΔ鈧Λ娆撳磽閸偂绻嗛柟缁樺笚濠€浼存煟濡や緡娈曢柡鍛劚閳规垿鎮╁▓鎸庢缂備浇椴稿ú鐔风暦閹达箑绠ｉ柨鏇楀亾缁炬儳缍婇弻鈥愁吋鎼粹€崇闂佺顑呴鍡樼┍婵犲洤围闁告侗鍘藉▓鍫曟⒑濞茶骞楅柣鐔叉櫊瀵鎮㈤悡搴ｎ唹闂侀€涘嵆濞佳冣枔椤撱垺鈷戠紒瀣劵椤箓鏌涢弮鈧崹鍨嚕婵犳碍鍋勯柣鎾虫捣椤︻參鎮峰鍐闁轰緡鍠栭埥澶愬閿涘嫬甯楅梻鍌欑閻忔繈顢栭崨顖滅當闁圭儤顨嗛ˉ鍡楊熆閼搁潧濮堥柣鎾卞劜缁绘繈妫冨☉娆樻！闂侀潻绲惧浠嬪蓟閻斿吋鍤戞い鎺戭槺閸旀悂姊婚崶褜妯€闁哄矉绲介～婊堝幢濡や胶浜梻浣筋嚙濞存碍绂嶉鍫濊摕闁哄洢鍨归悙濠勬喐瀹ュ鏁傛い鎾跺櫏濞堜粙鏌ｉ幇顒佲枙闁稿骸绻橀弻宥囨喆閸曨偆浼岄悗瑙勬礃閸庡ジ藝閾忣偁浜滈煫鍥ь儏閳ь剚顨堝Σ鎰板箻鐠囪尙锛滃┑鐐叉閸ㄨ偐绮ｅΔ鍛拺闂傚牃鏅濈粔鐢告煕閿濆繒鍒伴柣锝囧厴婵偓闁挎稑瀚板顕€姊婚崒姘卞闁哄懏绻勭划娆掔疀閹绢垱鏂€闂佺粯顭囩划顖氣槈瑜庨妵鍕箣濠靛浂妫﹂悗瑙勬礈閺佹悂鍩€椤掑﹦绉甸柛鐘愁殜閹繝鎮㈤崗鑲╁帾闂婎偄娲ら鍛村焵椤掍胶澧柍钘夘槼椤﹀綊鏌熼鑽ょ煓妞ゃ垺鐩幃娆撴偨閸偅鐦掑┑鐘愁問閸犳牠鏁冮敂鎯у灊妞ゆ牜鍋涚粻顖炴煕濞戝崬鐏￠柛鐘叉閺屾盯寮撮妸銉ょ暗闂佸憡绻冮〃濠傤潖缂佹ɑ濯村〒姘煎灣閸旀悂鏌ｆ惔銏⑩枔闁哄懏绻堝畷姘跺箳濡も偓缁犺崵鈧娲栧ú锕€鈻撻幆褉鏀芥い鏂款潟娴犳粓鏌涚€ｎ偅灏甸柍褜鍓濋～澶娒洪埡鍐濞达綁鈧稓绠氶梺姹囧€ら崹鐓幬ｆィ鍐┾拺闁圭娴烽妴鎺楁煕鐎ｃ劌鈧洟锝炶箛鏇犵＜婵☆垵顕ч鎾剁磽娴ｅ湱鈽夋い鎴濇噹閳绘捇顢橀姀锛勫幗闁瑰吋鐣崹濠氬煝閹剧粯鐓涢柛娑卞灠閳诲牓鏌曢崱鏇狀槮闁宠閰ｉ獮姗€宕橀幓鎺撴殢濠碉紕鍋戦崐鏍箰妤ｅ啫纾婚柣鏂垮悑閸嬫﹢鏌曟径鍫濆姉闁衡偓娴犲绠抽柟鎯版绾惧綊鏌熼悧鍫熺凡缁炬儳顭烽弻鐔兼倷椤掑倹娈繛瀛樼矋缁秹濡甸崟顖氱閻犻缚妗ㄥ▽顏堟⒑閻熸澘鎮戦柛鏃€鐟╁璇差吋閸ャ劌鐝伴梺鍝勮閸庡崬顕ｉ弶璇炬棃鎮╅棃娑楁勃闁汇埄鍨埀顒佸墯閸ゆ洘銇勯幒鎴濐仼缂佲偓閸垺鍠愰柟杈剧畱缁€鍌炴煙閻戞﹩娈曢柍閿嬪浮閺屾稓浠﹂幑鎰棟闂侀€炲苯澧柟顔煎€搁悾鐑藉箛椤撗勑ч柟鍏肩暘閸╁嫰宕戦妸銉㈡斀妞ゆ梻鐡旈悞鐐箾婢跺娲撮柟顔惧仱瀹曞綊顢曢悩杈╃泿闂備礁婀遍崕銈夊垂閻㈢鐒垫い鎺嗗亾闁硅绱曠划瀣箳閹搭厾鍙嗛梺鍓插亞閸犳捇宕㈤幆褉鏀介柣鎰硾閽勫吋銇勯弴鍡楁处閸婂爼鏌ㄩ悢鍝勑ｉ柣鎾寸洴閺屾稑鈽夐崡鐐茬闂佺硶鏅徊楣冨Φ閸曨垰顫呴柨娑樺濡插牆顪冮妶搴″箲闁告梹鍨甸悾鐑藉Ω閳哄﹥鏅梺闈涚墕濞层倗鑺遍妷鈺傗拻闁稿本鑹鹃埀顒傚厴閹虫宕奸弴妞诲亾閿曞倸閱囬柕澶堝劚閻濇ê顪冮妶鍡楀潑闁稿鎸婚妵鍕敃閿濆洨鐤勬繝纰樺墲閹倿寮崒鐐村殟闁靛／鍐▏濠电姷鏁告慨鎾儉婢舵劕绾ч幖瀛樻尭娴滅偓淇婇妶鍕妽闁告瑥绻橀弻锝夊箣閿濆棭妫勭紒鎯у⒔缁垳鎹㈠☉銏犵闁绘垵妫涢崝顖氣攽閻愭潙鐏﹂柨鏇楁櫊閹繝濡烽埡鍌滃幈闂佸啿鎼敃锝囪姳閻㈠憡鐓曢柡鍌濇硶鏁堝Δ鐘靛仜缁绘ê鐣烽妸鈺佺骇闁瑰鍋涚粊鑸典繆閻愵亜鈧牠骞愰悙顒€鍨旀い鎾卞灩閻?${issueId}`, () => adapter.updateIssue(issueId, payload), { kind: "issue", id: issueId });
    }
    return;
  }

  const card = event.target.closest("[data-issue-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "issue", id: card.dataset.issueCard };
  await loadHistoryDetail("issue", card.dataset.issueCard);
  renderIssues();
  renderDetailPanel();
}

async function handleWorkAreaClick(event) {
  const card = event.target.closest("[data-work-area-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "workArea", id: card.dataset.workAreaCard };
  await loadSpatialDetail("workArea", card.dataset.workAreaCard);
  await loadHistoryDetail("workArea", card.dataset.workAreaCard);
  renderWorkAreas();
  renderDetailPanel();
}

function handleReportClick(event) {
  const card = event.target.closest("[data-report-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "report", id: card.dataset.reportCard };
  renderReports();
  renderDetailPanel();
}

async function handleQuantityClick(event) {
  const card = event.target.closest("[data-quantity-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "quantity", id: card.dataset.quantityCard };
  await loadSpatialDetail("quantity", card.dataset.quantityCard);
  await loadHistoryDetail("quantity", card.dataset.quantityCard);
  renderQuantities();
  renderDetailPanel();
}

function handleDesignQuantityClick(event) {
  const card = event.target.closest("[data-design-quantity-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "designQuantity", id: card.dataset.designQuantityCard };
  renderDesignQuantities();
  renderDetailPanel();
}

function handleResourceLogClick(event) {
  const card = event.target.closest("[data-resource-log-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "resourceLog", id: card.dataset.resourceLogCard };
  renderResourceLogs();
  renderDetailPanel();
}

function handleDesignSpatialClick(event) {
  const card = event.target.closest("[data-design-spatial-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "designSpatial", id: card.dataset.designSpatialCard };
  renderDesignSpatialObjects();
  renderDetailPanel();
}

function handleTerrainClick(event) {
  const card = event.target.closest("[data-terrain-card]");
  if (!card) {
    return;
  }
  selectedDetail = { kind: "terrain", id: card.dataset.terrainCard };
  renderTerrainObjects();
  renderDetailPanel();
}

async function runAction(label, action, nextSelection = null) {
  try {
    state = await action();
    spatialDetailCache = { workArea: {}, quantity: {} };
    historyDetailCache = { workArea: {}, task: {}, issue: {}, quantity: {} };
    if (nextSelection) {
      selectedDetail = nextSelection;
    }
    logAction(label);
    render();
  } catch (error) {
    console.error(error);
    logAction(`${label} failed: ${error.message}`);
    renderLog();
  }
}

async function loadSpatialDetail(kind, id) {
  const cache = spatialDetailCache[kind];
  if (cache[id]) {
    return cache[id];
  }
  try {
    const payload = kind === "workArea"
      ? await adapter.getWorkAreaSpatial(id)
      : await adapter.getQuantitySpatial(id);
    cache[id] = payload;
    return payload;
  } catch (error) {
    console.error(error);
    cache[id] = { error: error.message, spatial: [] };
    return cache[id];
  }
}

function getSpatialDetail(kind, id) {
  return spatialDetailCache[kind]?.[id] || null;
}

async function loadHistoryDetail(kind, id) {
  const cache = historyDetailCache[kind];
  if (cache[id]) {
    return cache[id];
  }
  try {
    let payload = [];
    if (kind === "workArea") {
      payload = await adapter.getWorkAreaHistory(id);
    } else if (kind === "task") {
      payload = await adapter.getTaskHistory(id);
    } else if (kind === "issue") {
      payload = await adapter.getIssueHistory(id);
    } else if (kind === "quantity") {
      payload = await adapter.getQuantityHistory(id);
    }
    cache[id] = payload;
    return payload;
  } catch (error) {
    console.error(error);
    cache[id] = { error: error.message, history: [] };
    return cache[id];
  }
}

function getHistoryDetail(kind, id) {
  return historyDetailCache[kind]?.[id] || null;
}

function historyPrimaryLine(kind, item) {
  if (kind === "task") {
    return `${taskStatusLabel(item.new_status || item.newStatus || "planned")} / Done ${percent(item.new_completion_ratio || item.newCompletionRatio || 0)}`;
  }
  if (kind === "issue") {
    return `${issueStatusLabel(item.new_status || item.newStatus || "open")} / Severity ${issueSeverityLabel(item.new_severity || item.newSeverity || "medium")}`;
  }
  if (kind === "workArea") {
    return `${workAreaStatusLabel(item.status || "in_progress")} / Planned ${percent(item.planned_progress || item.plannedProgress || 0)} / Actual ${percent(item.actual_progress || item.actualProgress || 0)}`;
  }
  if (kind === "quantity") {
    return `${quantityStatusLabel(item.status || "in_progress")} / Planned ${formatMetric(item.planned_quantity || item.plannedQuantity || 0)} / Actual ${formatMetric(item.actual_quantity || item.actualQuantity || 0)}`;
  }
  return "No details available";
}

function summarizeQuantities(quantities) {
  const summary = {
    itemCount: quantities.length,
    totalPlanned: 0,
    totalActual: 0,
    totalVariance: 0,
    completionRatio: 0,
    categories: [],
    warnings: [],
  };
  const buckets = new Map();

  quantities.forEach((quantity) => {
    const planned = Number(quantity.plannedQuantity || 0);
    const actual = Number(quantity.actualQuantity || 0);
    const variance = actual - planned;
    const ratio = planned > 0 ? actual / planned : (actual > 0 ? 1 : 0);
    const category = quantity.category || "general";

    summary.totalPlanned += planned;
    summary.totalActual += actual;
    summary.totalVariance += variance;

    if (!buckets.has(category)) {
      buckets.set(category, {
        category,
        itemCount: 0,
        totalPlanned: 0,
        totalActual: 0,
        totalVariance: 0,
        completionRatio: 0,
      });
    }

    const bucket = buckets.get(category);
    bucket.itemCount += 1;
    bucket.totalPlanned += planned;
    bucket.totalActual += actual;
    bucket.totalVariance += variance;

    if (planned > 0 && actual < planned) {
      summary.warnings.push({
        id: quantity.id,
        itemName: quantity.itemName,
        workAreaId: quantity.workAreaId,
        plannedQuantity: planned,
        actualQuantity: actual,
        variance,
        unit: quantity.unit,
        warningLevel: ratio < 0.5 ? "danger" : "warn",
      });
    }
  });

  summary.completionRatio = summary.totalPlanned > 0 ? (summary.totalActual / summary.totalPlanned) : 0;
  summary.categories = Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      completionRatio: bucket.totalPlanned > 0 ? (bucket.totalActual / bucket.totalPlanned) : 0,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
  summary.warnings.sort((a, b) => a.variance - b.variance);
  return summary;
}

function summarizeDesignComparison(designQuantities, actualQuantities) {
  const actualByKey = new Map(
    actualQuantities.map((item) => [item.itemCode || item.itemName, item]),
  );
  let totalTarget = 0;
  let totalActual = 0;
  designQuantities.forEach((item) => {
    const key = item.itemCode || item.itemName;
    const actual = actualByKey.get(key)?.actualQuantity || 0;
    totalTarget += Number(item.targetQuantity || 0);
    totalActual += Number(actual || 0);
  });
  return {
    totalTarget,
    totalActual,
    totalVariance: totalActual - totalTarget,
    completionRatio: totalTarget > 0 ? (totalActual / totalTarget) : 0,
  };
}

function summarizeResourceLogs(resourceLogs) {
  const totals = {
    labor: { quantity: 0, units: new Set() },
    machine: { quantity: 0, units: new Set() },
    material: { quantity: 0, units: new Set() },
  };

  resourceLogs.forEach((resourceLog) => {
    const bucket = totals[resourceLog.resourceType];
    if (!bucket) {
      return;
    }
    bucket.quantity += Number(resourceLog.quantity || 0);
    if (resourceLog.unit) {
      bucket.units.add(resourceLog.unit);
    }
  });

  return {
    itemCount: resourceLogs.length,
    totals,
  };
}

function formatResourceMetric(bucket) {
  if (!bucket) {
    return "-";
  }
  const unit = bucket.units.size === 1 ? [...bucket.units][0] : bucket.units.size > 1 ? "mixed" : "";
  return `${formatMetric(bucket.quantity)}${unit ? ` ${unit}` : ""}`;
}

function designSpatialTypeLabel(type) {
  if (type === "alignment") {
    return "Alignment";
  }
  if (type === "surface") {
    return "Surface";
  }
  if (type === "zone") {
    return "Zone";
  }
  if (type === "reference") {
    return "Reference";
  }
  return type;
}

function formatDesignSpatialRange(item) {
  if (item.stationStart != null && item.stationEnd != null) {
    return `station ${formatMetric(item.stationStart)} - ${formatMetric(item.stationEnd)}`;
  }
  if (
    item.bboxMinX != null && item.bboxMinY != null && item.bboxMinZ != null &&
    item.bboxMaxX != null && item.bboxMaxY != null && item.bboxMaxZ != null
  ) {
    return `bbox ${formatMetric(item.bboxMinX)}, ${formatMetric(item.bboxMinY)}, ${formatMetric(item.bboxMinZ)} -> ${formatMetric(item.bboxMaxX)}, ${formatMetric(item.bboxMaxY)}, ${formatMetric(item.bboxMaxZ)}`;
  }
  return item.designRef || "No design reference";
}

function parseOptionalNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatOptionalInput(value) {
  return value == null ? "" : String(value);
}

function summarizeWorkAreaHealth(workArea, tasks, issues, quantities) {
  const overdueTasks = tasks.filter(isTaskOverdue).length;
  const openIssues = issues.filter((item) => item.status !== IssueStatus.CLOSED).length;
  const criticalIssues = issues.filter((item) => item.severity === IssueSeverity.CRITICAL).length;
  const quantitySummary = summarizeQuantities(quantities);
  let score = 100;

  score -= overdueTasks * 12;
  score -= openIssues * 6;
  score -= criticalIssues * 10;
  if (workArea.status === "delayed") {
    score -= 18;
  }
  if (quantitySummary.totalVariance < 0) {
    score -= Math.min(20, Math.round(Math.abs(quantitySummary.totalVariance) / Math.max(quantitySummary.totalPlanned || 1, 1) * 100));
  }
  score = Math.max(0, Math.min(100, score));

  let label = "Healthy";
  if (score < 60) {
    label = "At Risk";
  } else if (score < 80) {
    label = "Watch";
  }

  return {
    score,
    label,
    overdueTasks,
    openIssues,
    variance: quantitySummary.totalVariance,
    taskHint: overdueTasks > 0 ? "Overdue tasks need follow-up" : "No overdue tasks",
    issueHint: openIssues > 0 ? "Open issues need follow-up" : "No open issues",
    quantityHint: quantitySummary.totalVariance < 0 ? "Actual is behind planned" : "Quantities are on track",
  };
}

function badgeClassForQuantity(quantity) {
  if (quantity.status === "done") {
    return "ok";
  }
  if (quantity.status === "not_started") {
    return "warn";
  }
  return "danger";
}

function kindLabel(kind) {
  if (kind === "task") {
    return "Task";
  }
  if (kind === "issue") {
    return "Issue";
  }
  if (kind === "report") {
    return "Report";
  }
  if (kind === "quantity") {
    return "Quantity";
  }
  if (kind === "designQuantity") {
    return "Design Quantity";
  }
  if (kind === "resourceLog") {
    return "Resource Log";
  }
  if (kind === "designSpatial") {
    return "Design Spatial";
  }
  if (kind === "workArea") {
    return "Work Area";
  }
  return kind;
}

function resourceTypeLabel(type) {
  if (type === "labor") {
    return "Labor";
  }
  if (type === "machine") {
    return "Machine";
  }
  if (type === "material") {
    return "Material";
  }
  return type;
}

function badgeClassForIssue(issue) {
  if (issue.severity === IssueSeverity.CRITICAL || isIssueOverdue(issue)) {
    return "danger";
  }
  if (issue.severity === IssueSeverity.HIGH) {
    return "warn";
  }
  return "ok";
}

function badgeClassForWorkArea(area) {
  if (area.status === "delayed") {
    return "danger";
  }
  if (area.status === "done") {
    return "ok";
  }
  return "warn";
}

window.selectDetailRecord = async function selectDetailRecord(kind, id) {
  selectedDetail = { kind, id };
  if (kind === "workArea" || kind === "quantity") {
    await loadSpatialDetail(kind, id);
  }
  if (kind === "workArea" || kind === "task" || kind === "issue" || kind === "quantity") {
    await loadHistoryDetail(kind, id);
  }
  render();
};

function resetQuantityForm() {
  elements.quantityForm.reset();
  elements.quantityUnit.value = "m3";
  elements.quantityPlanned.value = "0";
  elements.quantityActual.value = "0";
}

function resetDesignQuantityForm() {
  elements.designQuantityForm.reset();
  elements.designQuantityUnit.value = "m3";
  elements.designQuantityTarget.value = "0";
}

function resetResourceLogForm() {
  elements.resourceLogForm.reset();
  elements.resourceType.value = "labor";
  elements.resourceCategory.value = "labor";
  elements.resourceSubtype.value = "";
  elements.resourceQuantity.value = "0";
  elements.resourceDay.value = String(state.currentDay);
  elements.resourceTeamName.value = "";
  elements.resourceSpecification.value = "";
  elements.resourceSourceType.value = "manual";
}

function resetDesignSpatialForm() {
  elements.designSpatialForm.reset();
  elements.designSpatialType.value = "alignment";
  elements.designSpatialCoordSystem.value = "station";
}

function updateTerrainTypeOptions() {
  const current = elements.terrainTypeFilter?.value || filters.terrainType;
  const values = [...new Set((state.terrainRawObjects || []).map((item) => item.terrainType).filter(Boolean))].sort();
  const options = values.map((value) => `<option value="${value}">${terrainTypeLabel(value)}</option>`).join("");
  updateSelectOptions(elements.terrainTypeFilter, options, current || "all");
}

function getVisibleTerrainObjects() {
  return [...(state.terrainRawObjects || [])]
    .filter((terrainObject) => filters.terrainType === "all" || terrainObject.terrainType === filters.terrainType)
    .filter((terrainObject) => filters.terrainCoordSystem === "all" || terrainObject.coordSystem === filters.terrainCoordSystem)
    .filter((terrainObject) => matchesSearch(`${terrainObject.name} ${terrainObject.heightmapRef} ${terrainObject.meshRef} ${terrainObject.textureRef} ${terrainObject.notes}`, filters.terrainSearch))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderTerrainObjects() {
  const terrainObjects = getVisibleTerrainObjects();
  if (!terrainObjects.length) {
    elements.terrainList.innerHTML = '<p class="empty-state">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈嗙節閳ь剟鏌嗗鍛姦濡炪倖甯掗崐褰掑吹閳ь剟鏌ｆ惔銏犲毈闁告瑥鍟悾宄扮暦閸パ屾闁诲函绲婚崝瀣уΔ鍛拺闁革富鍘奸崝瀣煕閵娿儳绉虹€规洘鍔欓幃娆撴倻濡桨鐢绘繝鐢靛Т閿曘倝宕幍顔句笉闁煎鍊愰崑鎾斥枔閸喗鐏嶆繝鐢靛仜閿曨亜顕ｉ锕€绀冩い鏃囧亹閿涙粌鈹戦悙鏉戠仸闁煎綊绠栭悰顔嘉旈崨顔规嫽婵炴挻鍩冮崑鎾寸箾娴ｅ啿鎳忓畷鏌ユ煕椤愮姴鍔氶柡鍕╁劦閺屾盯寮撮妸銉т画闂佺锕ゅ锟犲蓟濞戙垹绠绘俊銈傚亾闁硅櫕鍔欓弫宥咁煥閸啿鎷洪悷婊呭鐢帗绂嶆导瀛樼厱婵炲棗绻橀妤呮煃缂佹ɑ灏い顓滃姂瀹曞ジ鎮㈤崫鍕闂佽楠搁崢婊堝磻閹剧粯鐓冪憸婊堝礈閻旈鏆﹀ù鍏兼綑閸愨偓濡炪倖鎸鹃崑鐘诲箺閺囥垺鈷戦柟鑲╁仜閸旀挳鏌涢幘鏉戝摵鐎殿喗褰冮埞鎴犫偓锝庡亞閸樻捇鎮峰鍕煉鐎规洘绮撻幃銏＄附婢跺﹥顓跨紓鍌欑椤戝懐鑺遍崡鐐嶏綁宕奸妷锔惧帾闂婎偄娲㈤崕宕囧閸ф鐓曟慨妞诲亾濞存粏娉涢～蹇撁洪鍜佹濠电偞鍨兼禍顒勫矗濮橆厾绡€缁剧増菤閸嬫捇鎼归銏㈢崺缂傚倷绶￠崰鏍€﹂悜钘夌畺婵炲棙鎸哥粻瑙勩亜閹捐泛娅忛柛鐔风Ч濮婄粯鎷呴搹鐟扮闂佸憡姊瑰ú鐔笺€佸棰濇晣闁绘柨鎲￠悵宄邦渻閵堝懐绠伴柣妤€锕畷鐢稿即閵忥紕鍘甸梻渚囧弿缁犳垿鐛幋婢濈懓顭ㄩ崟顓犵厜闂佸搫鐬奸崰鏍х暦椤愶箑绀嬫い鎺戭槹椤ワ絽鈹戦悙鑼憼缂侇喗鎸剧划濠氬冀瑜滃鏍煣韫囨凹娼愰悗姘哺閺屾稑鈻庤箛锝喰ㄥ銈傛櫇婢ф鎹㈠☉姘ｅ亾濞戞瑯鐒介柣顓烆儑缁辨帞鎷犻幓鎺濅純濡ょ姷鍋為崹鎸庢叏閳ь剟鏌ｅ鍡椾簼妞ゎ偄绉瑰娲濞戞氨顔婃繝娈垮枛椤曨厾鍒掗敐鍛婵妫欑€靛矂姊洪棃娑氬婵☆偅绋掗弲鍫曨敆娴ｅ吀绨婚梺鍝勬川閸犳劗浜搁敃鍌涚厸濞达絿鎳撴慨宥団偓瑙勬磸閸庨潧鐣峰鈧濠氬Ψ閵夈儱寮烽梺璇叉唉椤煤濮椻偓瀹曟洘绺介崲搴涘姂瀹曟帡鎮欓幖顓燁棅婵＄偑鍊栫敮鎺椝囬娑欐珷妞ゆ洍鍋撻柡灞界Ф閹叉挳宕熼銈勭礉闂備焦鎮堕崝宥夊磿閹惰姤鍋╅柣鎴ｆ閻愬﹦鎲歌箛娑樺偍濞寸姴顑嗛悡鐔煎箹濞ｎ剙鈧倕顭囬幇顓犵闁圭粯甯炵粻鑽も偓瑙勬礃缁诲牓鐛€ｎ喗鏅滈悶娑掆偓鍏呭婵炶揪绲跨涵鍫曞几鎼淬劍鐓欓柟顖嗗拑绱炲銇礁鎳愮壕濂告煟閹伴潧澧紒鎯板皺閹叉悂寮跺▎鐐枅閻庤娲﹂崑鍕亙闂佸憡鍔︽禍鐐烘晬濠靛鈷戠紒瀣濠€浼存煠瑜版帞鐣洪柛鈹惧亾濡炪倖甯婇悞锕傚磹閹邦喒鍋撶憴鍕闁告梹鐟╅獮鍐煥閸喎娈熼梺闈涱槶閸庢煡鎮鹃柆宥嗏拻濞达綀妫勬禍瑙勩亜椤撶偟澧﹂柟顔矫～婵堟崉閾忓湱鍘梻濠庡亜濞诧妇绮欓幒妤佸亗婵炲棙鎸婚悡娆愩亜閺嶃劎鐭婃い锝呭悑閵囧嫰濡烽妷顔叫ㄩ梺姹囧労娴滎亪銆佸Ο琛℃婵☆垳鎳撻ˉ姘舵⒒閸屾艾鈧悂宕愬畡鎳婂綊宕堕濠勭◤婵犮垼鍩栭崝鏇犲閸ф鐓熼柟鎯у暱椤斿倹绻涢幋娆忕仼缂佲偓鐎ｎ偁浜滈柡宥冨妿閳藉鏌ｅ┑鍥棃婵﹨娅ｇ槐鎺懳熼懡銈呭汲闂備胶顢婃慨銈囧垝鎼达絽鍨濈紓浣骨滈崑鍛存煕閹般劍娅囬柛妯兼暬閺岋絾鎯旈敐鍡樻瘎濡炪値鍘奸悧鎾诲春閳ь剚銇勯幒宥囶槮闁诲繈鍎查妵鍕敃閿濆洨鐤勫銈冨灪閻楃娀宕洪敍鍕ㄥ亾閿濆骸澧扮悮锕傛煟鎼淬値娼愭繛鍙夌墵婵″爼骞栨担鍝ョ暫闂侀潧绻堥崹濠氭儗濞嗘挻鐓曟い顓熷灥閺嬫瑧绱掓潏鈺佹瀻闁宠鍨块幃鈺呮嚑椤掍緡妫勯梻浣告惈椤︻垳鑺遍柆宥呯；闁规崘顕х粻娑㈡煛婢跺孩纭堕柨娑欑洴濮婃椽鎮烽弶搴撴寖缂備緡鍣崹鍫曞箖閿熺姵鍋勯梻鈧幇顔剧暰闂備線娼ч悧鍡涘磹閸涘﹦顩插Δ锝呭暞閳锋垿鏌熺粙鍨劉濠㈣泛瀚湁婵犲﹤瀚惌鎺撱亜閵忊€冲摵闁轰焦鍔栧鍕熺紒妯荤彇闂傚倷鐒︾€笛兠哄澶婄；闁规儳澧庣壕濂告煟濡寧鐝柣銊﹀灴閺岀喖骞撻幒鎾虫殘閻庡灚婢樼€氫即鐛崶顒夋晢闁稿本纰嶉幉銏＄節閻㈤潧浠滄い鏇ㄥ幗閹便劑骞橀鍛櫈闂佺硶鍓濈粙鎺楀磻閸岀偞鐓熼柡鍌氱仢閹垿鏌ｉ幘瀵告噰婵﹥妞介、姗€濡歌閺嗙姵绻濋埛鈧仦鑺ョ亾缂備浇椴哥敮锟犲箖椤忓嫧鏋庨煫鍥ㄦ煥椤︹晠姊虹紒妯诲鞍婵炶尙鍠栧濠氬Ω閵夈垺鏂€闂佺硶鍓濋悷銉┞烽埀顒佷繆閻愵亜鈧垿宕曢柆宓ュ洭鎮界粙鑳憰閻庡箍鍎卞ú锕傚窗閸℃稒鐓曢柡鍥ュ妼娴滅偛霉閻撳海鐒告慨濠呮閹风娀鍨鹃搹顐や憾闂備浇宕甸崯鍧楀疾閻樿尙鏆︽繛宸簻閻掓椽鏌涢幇銊︽珔妞ゅ孩鎹囬幃妤呮偡閺夋浼冮梺绋款儏閿曘倛鐏嬪┑鐘诧工閻楀﹪鍩涢幒妤佺厱閻忕偞宕樻竟姗€鏌嶈閸撴岸骞冮崒姘辨殾闁归偊鍙庡Σ褰掑箹鏉堝墽鎮奸柣鎺戝悑缁绘盯骞橀弶鎴犲姲闂佺顑嗛幐濠氥€冮妷鈺傚€烽悗鐢殿焾閳峰苯顪冮妶鍐ㄧ仾婵炶尙鍠栧顐﹀磼閻愭潙鐧勬繝銏ｆ硾閿曘倝藟濡や胶绡€闁汇垽娼цⅷ闂佹悶鍔庨崢褔鍩㈤弬搴撴闁靛繆鈧櫕顓烘俊鐐€栭悧妤冨垝瀹ュ鏁冨ù鐘差儐閻撳繘鏌涢锝囩婵℃彃缍婇弻锝夊箻鐎涙顦ラ梺瀹狀潐閸ㄥ潡骞冮埡鍛闁圭儤绻€閹綁姊绘担鍛婃儓妞ゆ垵妫濆濠氬Ω閳哄倻鐣冲┑鐘垫暩婵澧濋梺绋款儐閹稿墽妲愰幒妤婃晩闁伙絽鏈崳褍顪冮妶搴′簻缂佺粯甯炲Σ鎰板箳閹冲磭鍠撻幏鐘差啅椤旂懓浜鹃柟鎯ь嚟缁犻箖鏌熼悙顒佺稇闁搞値鍓熼弻娑㈠Ω閿曗偓閳绘洜鈧娲樼换鍫濈暦椤愶箑唯鐟滃繘鏁嶅┑鍥╃閺夊牆澧界粔顒佺箾閸滃啰鎮奸柡渚囧枛閳藉濮€閿涘嫬骞堥梻浣告惈閸熺娀宕戦幘缁樼厽闁绘梹娼欓崝锕傛煙椤曗偓缁犳牠骞冨鍫熷癄濠㈠厜鏂傞崝搴ㄥ箟閸涘﹤绶為柟閭﹀墰閿涙盯姊洪悷鏉库挃缂侇噮鍨跺鏌ュ蓟閵夈儳顔愰柣搴㈢⊕閳笺倝顢旈崨顖ｆ锤闂佺粯鍔﹂崗娆愮濠婂牊鐓涚€广儱鍟俊鍧楁煃閽樺妲圭紒缁樼洴楠炴牠顢橀悙瀵镐壕闂備線鈧偛鑻晶鍙夈亜椤愩埄妲搁悡銈嗙節婵犲倻澧曠紒鎰殜閺屸€愁吋鎼粹€崇闂侀€炲苯鍘哥紒鑸佃壘椤曪絾绂掔€ｅ灚鏅濋梺鎸庣箓閹虫劙鏁嶈箛娑欌拻濞撴埃鍋撴繛浣冲棗娅ｉ梻浣告啞娓氭宕板Δ鍛剨闁绘劗鍎ら埛鎺楁煕鐏炴崘澹橀柍褜鍓氶幃鍌氱暦閹扮増鍊婚柤鎭掑劚濞堟垿姊洪崨濠冨矮缂佲偓娓氣偓瀹曠懓鈹戦崶銉ょ盎闂佸搫绋侀崑鍕濠婂懐纾奸柍褜鍓氬鍕箛椤撶姴骞愰柣搴＄畭閸庤鲸顨ョ粙娆惧殨濡わ絽鍟悡娑樏归敐澶嬩氦闂婎剦鍓熼弻锛勪沪缁洖浜鹃柟棰佺閹垿鏌熼懖鈺勊夐柍褜鍓欑壕顓㈩敊閹邦喚纾介柛灞捐壘閳ь剟顥撻幏瀣蓟閵夈儳鏌ч梺缁橆焾椤曆囨嫅閻斿吋鐓ユ繝闈涙閸熸帡鏌￠崘銊у闁绘帒鐏氶妵鍕箳閹存繍浠鹃梺绋款儏椤戝鎮￠锕€鐐婇柕濠忓椤︻厽绻涢幋鐐村碍缂佸顥愰悘鍐⒑閹稿海绠撻柟鍐查叄瀵娊鎮欓悜妯煎幗闂佽鍎抽悺銊х矆閸愵亞纾肩紓浣诡焽濞插瓨顨ラ悙宸剰闁宠鍨垮畷鍗烆潩椤掑倸骞嬮梻鍌氬€风粈渚€骞栭锔绘晞闁搞儺鍓欑粣妤呮煙閹规劕鐓愭い顐ｆ礋閺岀喖鎮滃鍡樼暥闂佺粯甯掗悘姘跺Φ閸曨垰绠抽柟瀛樼箥娴犲ジ姊绘担绋胯埞婵炲樊鍙冨濠氬即閻旈绐炲┑鐐村灦閿曗晛煤椤撱垺鈷戦柛娑橆煭閼版寧绻涙担鍐叉娴滄瑩姊绘担铏瑰笡闁挎洏鍨归…鍥槼缂佸倹甯掗…銊╁醇閻斿搫骞楅梻濠庡亜濞诧箑顫忛懡銈囦笉闁绘劗鍎ら悡娆愩亜閺冣偓閺嬪鎳撻崸妤佺厱闁冲搫顑囩弧鈧悗瑙勬磸閸旀垿銆佸▎鎾崇畾鐟滃秶绮鑸碘拻闁稿本鐟︾粊鏉库攽椤斿搫鈧繈寮€ｎ亶娓婚柕鍫濈箳閻ｈ櫕淇婇銏狀伂闁诲繑甯″娲焻閻愯尪瀚板褜鍨崇槐鎺旂磼濡偐鐣甸梺宕囩帛閹瑰洤鐣疯ぐ鎺濇晩闁伙絽濂旂花顕€姊婚崒娆掑厡妞ゎ厼鐗撻、鏍幢濞戞顔夐梺鎼炲劀鐏炲墽绋侀梻浣瑰劤缁绘劕锕㈡潏鈺侇棜闁稿繘妫跨换鍡樸亜閺嶃劎鈯曠紒鈧崘顔界厱闁靛鍎查崑銉╂煏閸℃洜顦﹂柍璇查叄楠炴﹢宕橀幓鎺撴殢濠碉紕鍋戦崐鏍箰妤ｅ啫纾婚柣妯硅閺夋椽姊婚崒姘偓椋庣矆娓氣偓楠炲鏁嶉崟顓犵厯闂佺鎻梽鍕磻閵堝鐓忓┑鐐靛亾濞呭懘鏌ｉ幘瀛樼闁哄瞼鍠栭幃婊兾熼悜姗嗗敶闁荤喐绮庢晶妤冩暜濡ゅ懎鐤鹃柡灞诲劜閻撴洘绻涢幋婵嗚埞闁哄鐩弻锟犲幢濡ゅ啫鈪靛┑顔硷龚濞咃綁骞忛悩璇茬伋鐎规洖娲ｉ崫妤呮⒒娴ｈ櫣甯涙い銊ユ楠炴垿宕惰閸ゆ洟鎮归崶銊с偞婵℃彃鐗撻弻鏇＄疀婵炴儳浜鹃柛蹇撴噽閻╁酣姊婚崒娆戭槮闁硅绱曢幑銏ゅ磼濠ф儳浜炬慨妯峰亾闁搞儜鍐ㄦ闂備礁鎲＄粙鎴︽偤閵娾晛纾归柣銏犳啞閸嬧剝绻涢崱妤冪妞ゅ浚浜炵槐鎺楀焵椤掑嫬绀冩い鏃傛櫕閸橀亶姊洪棃娑辩劸闁稿孩鐓″畷鎴﹀Ψ閳哄倻鍘藉┑鐐村灥瀹曨剟寮稿☉銏℃嚉闁挎繂顦伴悡鐘崇箾閺夋埈鍎愭繛鍛喘閺屻劌鈽夊▎鎴犵厐闂佸疇顫夐崹鍧楀春閵夆晛骞㈡俊銈呭暕閸栨牠姊绘担鍛婂暈妞ゎ厼妫濆畷鍫曞煛娴ｆ亽鍋婇梻鍌欑婢瑰﹪宕戞笟鈧畷鏇㈠蓟閵夈儳鍘遍梺鍦劋閸ゆ俺銇愰幒鎾存珳闂佹悶鍎崝灞解枔鐏炵瓔娓婚柕鍫濇缁€鍐磼椤斿吋鎹ｆ俊鍙夊姍楠炴帡寮埀顒傗偓姘哺閺岀喓绱掑Ο鍝勬綉闂佺顑嗛幐鑽ゆ崲濠靛棭娼╂い鎺戝€告慨锔戒繆閻愵亜鈧牜鏁繝鍕焼濞撴埃鍋撶€规洜鏁婚、妤呭礋椤掑倸骞堥梻浣筋潐閸庢娊顢氶銏犵疇闁搞儺鍓氶悡娆愩亜閺囨浜剧紓浣哄У閻楃娀鐛崘顔藉仼鐎光偓閳ь剟鎯屽▎鎾寸厱妞ゎ厽鍨甸弸锕傛煃瑜滈崜娆撴倶濠靛鐓橀柟杈鹃檮閸婄兘鏌℃径瀣仼濞寸姵鎮傚娲嚒閵堝懏娈岄梺鎼炲劀閸愩劋鎲鹃梻鍌欑缂嶅﹤螞閸ф鍊块柨鏇炲€归崑鍌炴煟閺冨洤浜归柛娆愭崌閺屾盯濡烽敐鍛瀴缂備讲鍋撻柍褜鍓氱换娑氣偓鐢殿焾鏍＄紓渚囧枛閻倿鍨鹃敃鍌涘殑妞ゆ牭绲炬缂傚倸鍊风欢锟犲窗濡ゅ懏鍋￠柨鏃傛櫕閳瑰秴鈹戦悩鍙夋悙缂佺姷绮妵鍕籍閸パ傛睏濡炪倖鏌ㄩ敃銈夊煘閹寸偛绠犻梺绋匡攻閹瑰洭骞婂Δ鍛唶闁哄洨鍋涢崑宥夋⒑閻熸澘鈷旂紒顕呭灦瀹曟垿鍩勯崘顏嗙槇婵犵數濮撮崐鎼侇敂椤愶附鐓熸い鎾跺枎缁椦囨煃瑜滈崜婵嬶綖婢跺⊕鍝勎熼悡搴＄亰闂佺懓澧界换婵堟崲閸℃ɑ鍙忔繝闈涙閻掔偓淇婇幓鎺戔挃缂佽鲸鎸婚幏鍛村箵閹哄秴顥氭繝鐢靛Х閺佸憡鎱ㄩ弶鎳ㄦ椽鏁冮崒娑樹簵闂佸搫娲㈤崹娲偂閸愵喗鐓冮弶鐐村椤︼箓鏌￠崱娆忔灈闁哄苯绉归幐濠冨緞濡亶銊╂⒑濮瑰洤鍔村ù婊庝邯閻涱噣宕卞鍏碱€囬梻浣虹帛閹告悂濡堕幖浣歌摕闁挎稑瀚▽顏堟煕閹炬せ鍋撴俊鎻掔墦濮婅櫣鈧湱濮甸ˉ澶嬨亜閿曞倹娑ч柣锝囧厴閺佹捇鎮╅崘娴嬪亾閻戣姤鐓曢煫鍥ㄦ尰閸熺偤鏌涢埡鍌滄创婵﹤顭峰畷鎺戔枎閹烘垵甯紓鍌欑贰閸ｎ噣宕归幎钘夋瀬妞ゆ洍鍋撴鐐村笒铻栧ù锝堫潐閻濇牗淇婇悙顏勨偓鏇犳崲閹扮増鍋嬮柛鈩冪⊕鐎氬懘鏌ｉ弬鍨倯闁绘挾鍠栭弻锟犲磼濠靛洨銆婂┑鐐茬墦娴滃爼寮婚敍鍕ㄥ亾閿濆骸浜濇い銉ョ墦閺岋紕浠﹂崜褎鍒涢梺鐐藉劵缁犳捇鐛€ｎ亖鏀介柛銉㈡櫃閹查箖姊婚崒娆愮グ妞ゆ泦鍛床闁糕剝绋戠壕濠氭煙閸撗呭笡闁抽攱甯￠弻娑氫沪閸撗勫櫙闂佺绻愰張顒勫Φ閸曨垼鏁囬柣鎰版涧閳潧顪冮妶鍐ㄧ仾闁绘濮撮悾鐑藉础閻愨晜顫嶅┑鈽嗗灣閳峰牓宕ぐ鎺撯拻濞达綀顫夐崑鐘绘煕鎼淬垻鐭掔€规洏鍔戦、娆戠驳鐎ｎ亝娅楅梻鍌欐祰瀹曠敻宕伴幇顔煎灊閹兼番鍨哄▍鐘充繆閵堝懎鏆為柡鍡樼矒閺屽秹宕崟顒€娅ｉ梺鍝勵儎缁舵岸寮诲☉銏犵疀闂傚牊绋掗悘宥夋⒑缂佹ɑ灏柛搴ゅ皺閹广垹鈹戠€ｎ偒妫冨┑鐐村灦閻燁垰螞閿熺姵鈷戦柣鐔告緲閹垿鏌涢弮鈧悷鈺侇嚕鐠囨祴妲堥柕蹇曞瑜旈弻娑㈠焺閸愮偓鐣烽柣鐘叉川閸嬫盯鍩為幋锔绘晩缁绢厾鍏樼欢鏉戔攽閻愬弶瀚呯紓宥勭窔閻涱喛绠涘☉娆忎汗闁荤姴娲╃亸娆擃敊瀹€鍕拺闁革富鍘奸崝瀣磼鐠囨彃鈧绌辨繝鍥ㄥ€婚柤鎭掑劗閹风粯绻涙潏鍓у埌闁硅绻濆畷顖炴倷閻戞鍘遍梺闈浤涢崟顒佺槑缂傚倷娴囨禍顒勫磻閻愬灚宕叉繝闈涱儏绾惧吋绻濇繝鍌氼仾妞ゆ梹娲熷缁樻媴缁涘缍堥梺绋块閸氬骞堥妸鈺佄у璺猴功閺屟囨⒑閸︻厾甯涢悽顖楁櫊閹垽宕卞☉娆忎化闂佹儳绻掗幊鎾绘儍閹达附鐓涢柍褜鍓涚槐鎺懳熼崷顓犵暰闁诲海鎳撴竟濠囧窗閺嶃劍娅犻悗娑櫳戦崣蹇撯攽閻樻彃鏆為柕鍥ㄧ箞閺岋紕浠﹂懞銉ユ畻闂佽鍠楅悷鈺呭箠閻樺灚宕夊〒姘煎灟缁辨梹绻濋悽闈浶涢柟宄板暟娴狅箓鎮剧仦鍏碱敇闂傚倷绀侀幖顐﹀嫉椤掆偓鐓ら柣鏃堫棑閺嗭箓鏌熼鐐蹭喊婵¤尪顕ч—鍐Χ閸涱喚顩伴梺鍛娒肩划娆撳Υ閸愵喖唯闁冲搫鍊搁埀顒傚厴閺屸剝寰勭€ｎ亞浠搁柣鐘叉川閸嬫稖鐏冮梺缁橈耿濞佳勭濠婂嫨浜滈柟瀛樼箥濡偓闂侀潧妫旂粈渚€鍩ユ径濠庢建闁糕剝锚閸忓﹥淇婇悙顏勨偓鏍暜閹烘鍥级濡潧缍婂畷鍗炩枎閹寸媴绱抽梻浣侯焾閺堫剟鎳濇ィ鍐ㄧ劦妞ゆ帊鐒﹂崐鎰偓瑙勬礃閸旀牠藝閻楀牊鍎熼柨婵嗘川閸旇泛鈹戦悙瀛樺鞍闁糕晛鍟村畷鎴﹀箻缂佹ê鐧勫┑鐘绘涧椤戝棝鍩涢幋鐐簻闁瑰搫妫楁禍鍓х磽娴ｅ壊妲归柟绋垮暱椤曪綁宕ㄦ繝鍐€撶紓渚囧灡濞叉﹢寮埀顒勬⒒娴ｈ櫣甯涢柨姘舵煟閵堝懏澶勭紒鏃傚枎椤粓鍩€椤掑嫬钃熼柨鏇炲€哥粈鍐┿亜韫囨挸顏柣搴″⒔缁辨挻鎷呴搹鐟扮闂佺儵鏅╅崹鍫曟偘椤旈敮鍋撻敐搴℃灍闁稿﹦鍏橀弻銈囧枈閸楃偛顫╂繝娈垮枟閻撯€愁潖缂佹ɑ濯村〒姘煎灣閸旂顪冮妶鍡楃仴婵☆偅绻堥悰顕€骞嬮敃鈧悙濠冦亜閹哄棗浜鹃梺鍝勵儎缁舵岸寮婚悢鍏肩劷闁挎洍鍋撴鐐搭殜閺屾稒鎯旈敐鍛€剧紓浣虹帛缁诲牆螞閸愩劉妲堟繛鍡樺姈閸婄兘姊绘担鍛婃儓妞ゆ垵鍟村畷鎰板冀椤愶絽搴婂┑鐘绘涧閻楀棝寮搁崼鐔剁箚妞ゆ牗绋掗妵鐔哥箾閸忕厧鐏存慨濠冩そ瀹曟粓鎳犻鈧敮銉︾箾鐎涙鐭ゅù婊勭矒閹箖鎮滈挊澶岊吅闂佹寧娲嶉崑鎾剁磼閻樺搫鍚圭紒杈ㄦ崌瀹曞ジ濮€閻樻ǜ鍎崇槐鎺楁偐閸愭彃鎽靛┑顔硷攻濡炶棄螞閸愩劉妲堟慨姗嗗墻閺嗩偅绻濋悽闈涗粶闁活亙鍗冲畷鎰板即閵忕姵杈堥梺鍐叉惈閹冲繘鍩涢幒鎳ㄥ綊鏁愰崟顕呭妳闂佺粯甯為崑鎾诲Φ閸曨垰绠ｆ繝闈涙祩濡倗绱撴笟鍥ф灍闁荤啿鏅犻悰顔嘉熼崗鐓庣彴闂佽偐鈷堥崜锕傚船瑜版帗鈷掑〒姘ｅ亾婵炰匠鍛床闁圭儤鎸搁崹鏃€銇勯幘璺哄壉闁绘帊绮欓弻鏇熺箾閻愵剚鐝曢梺缁樻尭閸熶即骞夌粙娆剧叆闁割偅绻勯ˇ顓㈡⒑缂佹ɑ顥堥柡鍛板皺閹广垽宕卞☉娆忊偓鍨箾閹寸偟鎳愰柣鎺嶇矙閺岋綁鎮㈡搴Ｐㄩ梺鍝勮嫰缁夌兘篓娓氣偓閺屾盯骞樼€靛憡鍣板銈冨灪瀹€鎼佸极閹邦厼绶炲┑鐘插閸熷淇婇悙顏勨偓鏍ь潖婵犳艾鐓曢柛顐ｇ箥閻掕棄鈹戦悩鍙夊闁抽攱鍨块弻锟犲磼濡搫濮曞┑鐐叉噹閹虫﹢寮诲☉銏″亞濞达絽鎽滄禒鎼佹⒑鐠団€虫灓闁轰礁顭烽悰顔芥償閵婏箑娈熼梺闈涱槶閸ㄨ櫣鈧俺妫勯埞鎴︽倷閼搁潧娑х紓鍌氱М閸嬫挸顪冮妶搴′簻妞わ箓娼ч悾鐑藉箣閿旇棄浜圭紓鍌欑劍椤洭宕㈤柆宥嗙厵闁稿繐鍚嬮崕妤呮煕閻樺磭澧柍璇茬Т椤撳ジ宕堕敐鍛濠电偛鐗嗛悘婵嬪几閻斿吋鐓熼柟鍨缁♀偓閻庤娲樺浠嬪极閹剧粯鍋愰柟缁樺笧閻涒晜淇婇悙顏勨偓鏍箰閻愵剚鍙忛柣銏犳啞閸婂灝螖閿濆懎鏆為柍閿嬪灴閺岋綁鎮㈤崨濠勫嚒闂佽鍠楅崹鍧楀蓟閿濆鏅查幖瀛樼箞閸嬫鎮楃憴鍕缂佽鍊块、姗€宕楅悡搴ｇ獮婵犵數濮寸€氼剟鐛崼銉︹拻濞达絼璀﹂弨浼存煙濞茶閭慨濠佺矙瀹曠喖顢涘鎲嬬幢闂備焦瀵х换鍌炈囨导瀛樺亗闁哄洢鍨洪悡蹇擃熆鐠轰警鍎忛柣蹇嬪劦閺屾盯鎮㈤崫鍕垫毉濡炪們鍔婇崕闈涚暦閸洦鏁嗗ù锝呭级鐎氬ジ姊绘笟鈧鑽も偓闈涚焸瀹曘垺绂掔€ｅ灚鏅滈梺缁樻濞咃絿澹曢悾灞稿亾楠炲灝鍔氶悗姘煎枤缁綁寮崒妤€浜炬繛鍫濈仢閺嬫稒銇勯鐘插幋鐎规洘妞藉畷鐔碱敍濮橀硸妲伴梻浣哥枃濡椼劎娆㈤敓鐘茬劦妞ゆ帊鐒﹀畷宀勬煛瀹€瀣М闁诡喓鍨藉畷顐﹀Ψ閿曗偓濞呮垿姊虹拠鎻掝劉闁告垵缍婂畷婊堟偄閻撳孩妲梺閫炲苯澧柕鍥у楠炴帒顓奸崶鑸敌滃┑鐘愁問閸犳牜绮旇ぐ鎺戣摕闁挎稑瀚▽顏堟煟閿濆懐娼＄憸宥夊煘閹达附鏅柛鏇ㄥ亜楠炲顪冮妶鍐ㄧ仾缂佸鍨块垾锕傚Ω閳轰礁绐涘銈嗘⒒閻℃棃宕畝鍕拻濞达絿鐡旈崵娆愭叏濮楀牏鐣甸柨婵堝仦瀵板嫭绻涢幒鎾淬仢鐎殿喕绮欓、姗€鎮欏畵顔兼处閻撴瑩姊婚崒姘煎殶妞わ讣濡囩槐鎺楁偐瀹曞洤鈷岄梺鍝勬湰濞叉繄绮诲☉姘ｅ亾閿濆簼绨撮柛瀣崌瀵挳鎮㈡總澶婃闂備胶绮…鍥╁垝椤栫偞鍋傞柡鍥ュ灪閻撴盯鏌涢妷顔惧帒妞ゅ繐鎳嶇换鍡涙煠濞村娅嗛柛鐘冲姍閺屸剝寰勬惔銏€婄紓浣哄Ь鐏忔瑧妲愰幒鏃傜＜婵☆垵鍋愰悿鍕⒑鐠団€虫灆缂侇喗鐟ヨ灋闁告劦鐓佽ぐ鎺斿彆闁圭粯甯掓慨锕傛⒑閸濆嫬顦柛鎾寸箞楠炲繘宕ㄩ弶鎴濈獩婵犵數濮撮崐鐟扳枔濮椻偓濮婄粯绗熼埀顒勫焵椤掍胶銆掗柍瑙勫浮閺屾盯寮埀顒勫垂閸ф宓侀柛鎰电厛閻撱儵鏌涢銈呮瀻闁谎冨缁绘繈濮€閿濆棛銆愬銈嗗灥濞差參宕洪埀顒併亜閹烘埈妲稿褍鐡ㄩ幈銊︾節閸愨斂浠㈤悗瑙勬磸閸斿秶鎹㈠┑瀣闁靛瀵屽鏃堟⒒閸屾瑧鍔嶉悗绗涘厾楦跨疀濞戞锛熼梻鍌氱墛缁嬫捇寮抽敃鍌涚叆婵犻潧妫涙晶銏ゆ煟閵堝倸浜鹃梻鍌欑閹碱偊宕愭禒瀣垫晩濠电姴瀚慨鍐测攽閻樺磭顣查柍閿嬪灴閹嘲鈻庤箛鎿冧患闂佸憡鏌ｉ崐妤呭焵椤掑喚娼愭繛璇х畵瀹曟粓鎮㈤悡搴ｇ暫濠殿喗銇涢崑鎾绘煕閳哄绡€鐎规洘锕㈤、鏃堝椽閸愵亞顢呴梻鍌氬€峰ù鍥敋閺嶎厼鍨傞幖杈剧磿閺嗗棝鏌嶈閸撶喎鐣烽妷褉鍋撻敐搴℃灍闁抽攱鍨块弻娑樷攽閸℃浼€闂佽绻樻禍鍫曞蓟濞戙垺鍋愮€规洖娲ら埅褰掓⒑娴兼瑧鍒伴柛銏＄叀閳ワ箓濡搁埡浣歌€块梺鍐叉惈閸婃劙顢楅崟顑芥嫼濠殿喚鎳撳ú銈夋倿濞差亝鐓曢柕濞炬櫃閹查箖鏌熼姘伃妞ゃ垺鐩幃娆撴嚑閼稿灚鍟洪梻鍌欑劍鐎笛呮崲閸岀倛鍥敍濠婂懍绗夋繝鐢靛У绾板秹宕愰崹顐ょ闁瑰鍋熼幊鎰版煟閹烘洖袚闁靛洤瀚伴弫鍌炲垂椤旇偐銈繝娈垮枛閿曘儱顪冮挊澶屾殾妞ゆ劧绠戠粈瀣亜閺囩偞鍣洪柦鎴濐樀濮婄粯鎷呴崨濠傛殘濠殿喖锕ょ紞濠傜暦瑜版帗鍋ㄩ柛鎾冲级閺咁亪姊洪幐搴ｇ畵妞わ缚绮欏顐も偓锝庡枟閻撳啰鎲稿鍫濈婵炲棙鎸婚崑鈺呮煟閹达絾顥夌紒鈧崼婢濆綊鏁愰崶銊ユ畬缂佸墽铏庨崹璺侯潖閾忓湱纾兼俊顖濇娴犳悂姊洪幐搴㈢５闁哄懐濮撮悾鐑筋敆閸曨偆顔岄梺鐟版惈濡瑩寮埀顒勬⒑閸︻厼鍔嬪┑鐐诧工閻ｇ兘骞囬鈺傛⒐閹峰懘鎮烽弶澶哥礋闂傚倷鑳剁划顖炲垂閻撳宫娑㈠礋椤撶儐妫滄繝鐢靛У绾板秹鎮￠悢鍏肩厵闂侇叏绠戦悘娑㈡煃瑜滈崗姗€宕戦幘缁樷拺闂侇偆鍋涢懟顖涙櫠閸撗呯＜闁绘娅曠亸顓㈡煟閿濆洤鍘寸€规洖銈稿鎾倷闂堟稑绠伴梻鍌欒兌椤牏鎮锕€纾归柡宥庡亞缁€濠冧繆閵堝懏鍣洪柍閿嬪笒闇夐柨婵嗘噺閸熺偤鎮归幇鍓佺瘈闁哄本绋掗幆鏂库槈濡嘲浜炬繝闈涱儏杩濋梺鍛婂姦閸犳牠鐛姀锛勭闁瑰鍎愰悞浠嬫煥濞戞瑧娲存慨濠呮閹叉挳宕熼顐ｎ棆濠电姭鎷冮崟鍨杹闂佽鍣换婵嬪极閹邦厼绶為悘鐐舵缁插ジ姊绘担瑙勫仩闁稿海鏁昏棢闁规崘顕х粈鍡涙煛婢跺绱╅柣鐔煎亰閻撱儵鏌涢埄鍐︿簼闁规儳鐓勬惔銊ョ倞鐟滄繈鐓浣典簻闁靛繆鍓濈粈瀣攽椤旂懓浜鹃梻浣虹帛椤牆鈻嶉弴銏╂晩闁圭儤鎸剧弧鈧┑鐐茬墕閻忔繈寮稿☉銏＄叆闁哄洦锚閸旀碍銇勯鍕殻闁圭锕ュ鍕沪閻愵剦鍟庡┑锛勫亼閸婃牠宕濊缁骞嬮悩鐢电劶闁诲函缍嗛崑浣圭濠婂牊鐓欓柛婵嗗鑲栭梺鍛婃煥缁夊綊骞冨Δ鈧～婵嬵敆閸岋妇绀婄紓鍌欐祰妞存悂骞戦崶褏鏆﹂柟鐑樺灍閺嬪酣鏌熼幖顓炲箺鐞氾箑鈹戦敍鍕杭闁稿﹥鐗犲畷褰掓濞磋櫕绋戦埞鎴﹀幢濞嗘劖顔曢柣鐔哥矌婢ф鏁幒妤佺叆闁靛牆妫旂换鍡涙煏閸繂鈧憡绂嶆ィ鍐┾拺闁告繂瀚銉╂煕鎼达絾鏆€殿喖顭峰鎾偄妞嬪海鐛繝鐢靛仦閸ㄨ泛顫濋妸鈺佹辈闁绘鏁哥壕钘壝归敐鍥剁劸妞わ絾濞婇弻娑氣偓锝冨妼閳ь剚绻傞锝嗙節濮橆厼浜滈梺绋跨箺閸嬫劙宕濋悜鑺モ拺闁圭瀛╃壕鐢告煕鐎ｎ偅灏い顓″劵椤︽潙顭胯椤ㄥ﹥淇婇悽绋跨妞ゆ牗鍑瑰濠囨⒑缂佹◤顏堝疮閸喒鏋旀俊銈傚亾闁宠鍨块、娆戞兜閻戠晫鍙嶆繝鐢靛仜閹锋垹寰婇崹顔ワ綁骞囬弶璺唺闂佺懓鍟跨壕顓㈠窗閺嵮呮殾妞ゆ劧绠戠粈瀣煕椤垵浜炵紒瀣喘濮婂宕掑▎鎰偘濡炪倖娉﹂崨顔煎簥闂佸綊鍋婇崰妤€鐣烽弻銉︾厵閺夊牓绠栧顕€鏌涚€ｅ墎绡€闁哄苯绉瑰畷顐﹀礋椤掆偓濞咃繝姊洪柅鐐茶嫰閸樺摜绱掗埀顒佺瑹閳ь剟宕洪姀鈩冨劅闁靛鍎抽鎺楁倵鐟欏嫭绀€婵炲眰鍊濋崺鈧い鎺戝€告禒婊勩亜椤忓嫬鏆ｅ┑鈥崇埣瀹曞崬螖閸愵亝鍟伴梻浣藉吹婵娊鎮為敃鍌涘亗闁跨喓濮峰畵渚€鐓崶銊︾缁炬儳鍚嬫穱濠囶敍濠靛棔姹楀銈嗘⒐濞茬喖寮婚埄鍐ㄧ窞濠电姴瀚。鐑樼節閳封偓閸屾粎鐓撻悗瑙勬礃绾板秶鈧絻鍋愰埀顒佺⊕椤洭宕㈤悽鍛婄厽闁绘ê寮堕崢鍌炴煕濞戝崬鐏ｆ俊鎻掓处娣囧﹪濡堕崶顬儵鏌涚€ｎ偆鈽夐摶鐐寸節闂堟稒顥犻柡鍡畱閳规垿宕掑搴ｅ姼闁哥儐鍨跺娲箰鎼粹懇鎷归梺绋垮婵炲﹪鎮伴鍢夋梹鎷呮搴ｇ暰闂備胶绮崝锔界濠婂牆鐒垫い鎺嶈兌婢у灚顨ラ悙鏉戝闁靛牞缍佸畷姗€濡歌缁辩敻姊绘担鍝ョШ闁稿锕畷鏇㈡偨閸涘﹥娅滄繝銏ｆ硾椤戝棝宕曢鍫熲拺闂傚牃鏅涢惁婊堟煕濮椻偓缁犳牠寮鍜佺叆闁告劗鍋撶€靛矂姊洪棃娑氬婵☆偅鐟╅崺娑㈠箳濡や胶鍘撻悗鐟板婢瑰棙鏅堕敃鍌涚厵妞ゆ洖妫涚弧鈧悗瑙勬礃椤ㄥ牓宕版繝鍐╃秶妞ゎ厽鍨甸弲顒勬⒒閸屾瑨鍏岀紒顕呭灦瀹曟繈寮介鐐电暰閻庡厜鍋撻柛鏇ㄥ墮閳ь剙鐏濋湁闁绘ê妯婇崕鎰版煟閹惧鎳冩い顏勫暟閳ь剨缍嗘禍顏堫敁濡ゅ懏鐓冮悹鍥皺婢э箓鏌″畝鈧崰搴ㄦ偩閻戣棄鐐婄憸澶愬几閸涘瓨鈷戠痪顓炴噺閻濐亞绱掗鑺ュ碍闁伙絿鏌夐妵鎰板箳濠靛洦娅囬梻渚€娼х换鍡涘礈濠靛鍎婇柟鐑橆殕閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ剚鍠愰幖娣妸閳ь剙鍟存俊鐑藉煛娴ｉ鐐婇梻渚€娼ч敍蹇涘磼濠婂懏鍠掗梻浣筋嚙妤犲摜绮诲澶婄？闂侇剙鍗曢崶顒夋晬婵犲﹤鍠氬Λ婊堟⒑缁夊棗瀚峰▓鏇㈡煃闁垮鐏﹂柕鍥у楠炴帡宕卞鎯ь棜闂傚倷绀侀幉锟犮€冮崱妞曟椽鎮㈡搴㈡闂佸壊鍋呭ú锕傚极閸℃鐔嗛悹杞拌閸庢劖绻涢崨顔惧⒌婵﹦绮幏鍛存惞閻熸壆顐奸梻浣告啞濮婂綊鎮ч弴鈶┾偓锕傚炊瑜夐弸搴ㄦ煙闁箑娅樻繛鑼焾閳规垶骞婇柛濠冨姍瀹曟垿骞樼紒妯煎帗闁荤喐鐟ョ€氼剟鎮橀幘顔界厵妞ゆ梻鏅幊鍥┾偓娈垮枛閻栧ジ鐛€ｎ喗鍋愰弶鍫厛閺佸洭姊婚崒姘偓椋庣矆娴ｅ搫顥氭い鎾卞焺閺佸嫰鏌￠崶銉ョ仼缁炬崘顫夌换娑㈠箣濞嗗繒浠兼俊妤€鎳樺娲捶椤撶儐鏆┑鐘灪椤洨鍒掓繝姘闁兼亽鍎抽崢鐢告⒑鐠団€崇€婚柛娑卞枟閸犳牠姊绘担铏瑰笡缂佽鍟换娑欑節閸屻倖缍庣紓鍌欑劍钃卞┑顖涙尦閺屾稑鈽夊鍫濅紣闂佸搫妫楅悧濠勬崲濞戙垹绠婚悗闈涘閺嗏€愁渻閵堝啫濡奸柨鏇樺€濋幃楣冩煥鐎ｎ亶鍤ら梺鍝勵槹閸ㄧ敻宕妸銉富闁靛牆妫欑亸鐢告煕鐎ｎ剙浠︽繛鐓庣箻瀹曞ジ濡烽敂瑙勫闂備礁鎲￠幐鏄忋亹閸愨晝顩叉繝闈涚墢绾惧吋绻涘顔荤敖闁伙綀娅ｉ埀顒侇問閸犳捇宕濆鍥╃焿闁圭儤鏌￠崑鎾绘晲鎼粹€茬敖闂佸憡眉缁瑥顫忔ウ瑁や汗闁圭儤鍨抽崰濠囨⒑閹肩偛濡洪柛妤佸▕楠炲棝宕橀闂寸炊闂佸憡娲滈弫鎼佸船閻㈠憡鍋℃繝濠傚缁犳绱掓潏鈺佷沪缂佹鍠栭崺鈧い鎺戝瀹撲線鏌涢幇鈺佸闁绘梻鍎ゅ畷澶愭煏婵炑冨缁额偊姊婚崒娆戭槮闁圭⒈鍋婂畷顖烆敃閿曗偓绾惧湱鎲搁悧鍫濈瑨闂傚偆鍨遍妵鍕棘鐠恒劍鐧侀梺琛″亾濞寸姴顑嗛悡鍐煏婢跺牆鍔氶柡鍡氫含缁辨帡鎮▎蹇斿闁绘挻娲熼弻锟犲礃閿濆懍澹曢梻浣藉吹閸熷潡寮查悩璇茬畺濞村吋鎯岄弫濠囨煕閵忕媭妲洪柛鐘虫尰缁傚秹骞栨担绋垮敤閻熸粌鏈粩鐔煎即閻愨晜鏂€闂佺粯鍔栧娆撴倶閿斿浜滈煫鍥风导闁垱銇勯姀鈩冾棃鐎规洖銈搁、鏇㈡晲閸℃褰呴梻鍌氬€烽懗鍫曞箠閹惧瓨娅犻柣锝呰嫰閸ㄦ繃銇勯弽顐粶闁绘挻娲熼弻鐔告綇妤ｅ啯顎嶉梺缁樻尰濞叉鎹㈠☉銏犵闁绘垵娲ら崣鏇㈡⒑閸涘﹥鈷掗柛鐘虫尵濡叉劙骞掑Δ浣镐汗闂佹儳娴氶崑鍕閹惰姤鈷戦悹鍥ｂ偓铏亶濡炪們鍔岄幊姗€鏁愰悙娴嬫斀閻庯絽鐏氶弲銏＄箾鏉堝墽鍒伴柟璇х節閹偓绻濆顓涙嫽婵炶揪缍€婵倝濡撮崘顔界厽闁硅櫣鍋熼悾鐢碘偓瑙勬礃缁诲牆顕ｉ崐鐕佹闂佹悶鍊栭〃濠囧蓟濞戙垹鍗抽柕濞垮劚缁犱即姊虹粙娆惧剱闁圭懓娲顐﹀箛椤撶喎鍔呭┑鐘绘涧閻楁劙宕楅幒鏃傜＝闁稿本鑹鹃埀顒佹倐瀹曟劘銇愰幒鎴狀唶缂傚倷鐒﹂…鍥煘瀹ュ應鏀介柣妯哄级婢跺嫰鏌涙繝鍥ㄦ暠闁靛洤瀚粻娑㈠箻閹颁椒妲愰梻浣侯焾椤戝棝骞戦崶褜鍤曞ù鐘差儛閺佸洭鏌ｉ弮鍥ㄨ吂缂傚啯娲熷缁樻媴缁涘缍堥悗瑙勬礃閿曘垽銆佸鎰佹Ь婵犮垼顫夊ú婊堝箟閹绢喖绀嬫い蹇撴閻ｉ箖姊绘笟鈧褔鎮ч崱娑樼疇閹兼番鍔屽Ч鍙夌箾閸℃绠氶柡鈧懞銉ｄ簻闁哄洨鍋為崳鐟邦熆瑜庨幐鎶藉蓟閿涘嫪娌柣锝呯潡閵夛负浜滅憸宀€娆㈠璺鸿摕婵炴垯鍨圭粻濠氭偣閾忕懓鍔嬮柣蹇撶墕铻栭柣姗€娼ф禒婊堟煕閻曚礁浜柣蹇撳暣濮婃椽鏌呴悙鑼跺濠⒀勬尦閺屾盯鍩為崹顔句紙濡ょ姷鍋為…鍥箯閻樿绠甸柟鐑樻煛閸嬫捇顢橀悜鍡樺瘜闂侀潧鐗嗗Λ娆撳煕閹烘鐓涢柛婊€绀佹禍婵堢磼閸屾稑绗уù鐙呯畵瀹曪綁濡疯閻ｉ箖姊绘担铏瑰笡闁告棑闄勭粋宥咁煥閸繄鍔﹀銈嗗笂閼宠埖鏅堕鍫熺厓缂備焦蓱椤ュ牓鏌℃担绋挎殻鐎规洘甯掗～婵嬪础閻愨晛浜鹃柣鎰劋閸嬧剝绻濇繝鍌氭殶缂佺姾宕甸埀顒冾潐濞测晝绱炴笟鈧畷娲焵椤掍降浜滈柟鍝勬娴滈箖姊虹€圭媭娼愰柛銊ユ健楠炲啴鍩￠崪浣规櫓闂佸吋绁撮弲娆戞濡崵绡€闁汇垽娼ф禒婊勩亜閿旇棄顥嬬紒顔界懇瀵粙顢橀悢宄板闁诲骸鍘滈崑鎾绘煕閺囥劌鍘撮柟鐤缁辨捇宕掑▎鎴濆闁藉啴浜堕弻锝夊箻閸楃偛濮曢梺闈涙搐鐎氱増淇婇幖浣肝ㄩ柍杞扮閸欏﹪姊绘担绛嬪殐闁革綆鍨抽幑銏犫攽閸ワ妇绠氶梺缁樺灱濡嫰鎮″☉銏＄厱閻忕偛澧介惌濠冾殽閻愯尙澧涚紒缁樼箞閹粙妫冨☉妤佸媰闂備焦鎮堕崝鎴濐焽瑜旈幃楣冩倻缁涘鏅㈤梺鍛婃处閸樿偐绮婇敃鈧埞鎴炲箠闁稿﹥娲熼獮濠呯疀濞戞瑥浜楅梺缁樻閸嬫劙宕ｉ幘缁樼厱闁靛绲芥俊浠嬫倶韫囨稒娑фい顓″劵椤у倿姊婚崟顐㈩伃妤犵偛鐗撴俊鎼佹晜閸撗呮闂備礁鎲℃笟妤呭闯椤旂晫顩烽柍鍝勬噺閳锋垹鎲搁悧鍫濅刊婵☆偅鍨甸埞鎴︽倷閳轰椒澹曢梻鍌欑劍閹爼宕濋幋鐘典笉闁哄稁鍘肩粻鍦喐閻楀牆淇柡浣稿暣閺屾洟宕煎┑鍡╀紑闂佺粯鐗犳禍璺侯潖婵犳艾纾兼慨姗嗗厴閸嬫挻顦版惔锝囩劶婵炴挻鍩冮崑鎾搭殽閻愬樊妯€闁轰焦鎹囬幃鈺呮嚑椤掑鏁归梻鍌欒兌閸樠囷綖閺囥垹纾归柡宓懏娈鹃梺鍝勮閸庢煡鎮￠弴鐔翠簻闁归偊鍠栧瓭闂佸憡鏌ｉ崐妤呭焵椤掑喚娼愰柟鎼侇棑濞嗐垹顫濈捄楦挎憰濠电偞鍨崹褰掓倿濞差亝鐓曢柟鏉垮悁缁ㄥ瓨淇婇幓鎺斿ⅱ缂佽鲸鎸荤粭鐔煎炊瑜岀花鑽ょ磽娴ｅ壊妲哥紓宥咃工椤曪絿鎷犲ù瀣潔闂侀潧绻嗛弲婊堝疾濠靛鈷戦柟绋挎捣缁犳挻绻涚仦鍌氬妞ゃ垺锕㈤幃鈩冩償濡粯鏉搁梻浣虹帛閸旀瑥顭囪閺侇噣宕奸弴鐔哄弳闂佸搫娲㈤崝瀣姳缂佹ǜ浜滄い鎰╁灮缁犱即鎮￠妶鍡愪簻闊洦鎸搁顐ｃ亜閿斿搫濮傛慨濠冩そ閹虫牠鍩為悙顒€鐝遍梻浣侯焾缁绘垿鎯勯鐐茶摕闁搞儺鍓﹂弫宥夋煟閹邦喛藟闁归攱妞藉娲川婵犲嫮鐣甸柣搴㈠嚬閸欏啫鐣烽幎鑺ユ優闁革富鍘鹃敍婊堟煟鎼搭垳绉甸柛瀣缁叀顦寸紒杈ㄥ浮椤㈡瑧鍠婇崡鐐插婵＄偑鍊栭幐鎼佸Χ缁嬭法鏆﹂梺顒€绉寸粻娑欍亜閹达絾纭堕柛鎴濈秺濮婂宕掑▎鎴М闂佺顕滅换婵嗙暦濠靛﹦鐤€婵炴垶顭囬弻褍鈹戦悙鏉戠仸闁荤啙鍥モ偓鍛存煥鐎ｃ劋绨婚梺鍝勭▉閸嬪嫭绂掗敃鍌涚厓闂佸灝顑呴悘鎾煛瀹€鈧崰鏍箠閺嶎厼鐓涘ù锝夘棑閹规洟姊绘担鍛婂暈闁哄矉绻濆畷鎴﹀箻缂佹ǚ鎷绘繛杈剧到閹诧繝宕悙瀵哥闁圭粯甯炵粻鑽も偓瑙勬礃缁诲倿顢橀崗鐓庣窞閻庯綆浜栭崑鎾诲醇閺囩喓鍘遍梺鏂ユ櫅閸犳岸鎮為悾宀€纾奸柍閿亾闁稿鎹囧缁樻媴閸︻厽鑿囬梺鎼炲姀濡嫰鈥﹂崶顏嶆Ъ缂備礁鍊圭敮锟犲极閸愵喖纾兼繛鎴炶壘楠炲秹姊绘担鍛婂暈缂佸鍨块弫鍐Ψ閳轰胶锛欓梺瑙勫婢ф鎮￠崘顔界厪濠㈣埖锚閻忥綁鏌ｉ敐鍥ㄦ毈闁哄瞼鍠栭、娆撴偩瀹€鈧悡澶愭⒑閸︻収鐒鹃柨鏇樺劚椤曘儵宕熼浣稿妳闂侀潧绻嗛埀顒冩珪濮ｅ洭姊婚崒姘偓鎼佸磹妞嬪海鐭嗗〒姘ｅ亾妤犵偞鐗犻、鏇㈠煕濮橆厽銇濆┑顔瑰亾闂侀潧鐗嗛幊搴ㄦ倵椤撱垺鍋℃繝濠傛噹椤ｅジ鎮介娑辨疁闁诡喒鍓濈粭鐔煎焵椤掑嫬钃熸繛鎴欏灩鍞梺鎸庣箓閹冲酣鈥栫€ｎ剛纾藉ù锝呭级椤庡棝鏌涚€ｎ偅宕屾慨濠傤煼瀹曟帒顫濋钘変壕闁归棿鐒﹂崑瀣攽閻樻彃鏆熼柣鐔活潐娣囧﹪濡堕崨顔兼缂佸墽鍋撶€笛呮崲濞戙垹绠ｆ繛鍡楃箳娴犻箖姊虹紒妯诲碍闁哥喍鍗抽獮澶岀矙濞嗗墽鍙嗛梺鍓插亝缁诲嫰藝椤撶偐鏀芥い鏃傜摂閻掑墽绱撻崼婊冨祮闁糕斁鍋撳銈嗗坊閸嬫捇鏌涢悢鍛婄稇闁伙絿鍏樻俊姝岊槷闁稿鎸搁埥澶娾枎濡厧濮洪梻浣风串缁蹭粙宕崸妤€鐓橀柟杈鹃檮閸嬫劙鏌涢…鎴濅簼婵絽瀚换婵嗏枔閸喗鐏嶉梺鐟版啞婵炲﹤顕ｉ锕€绀冩い鏂挎瑜旈弻娑㈠Ψ椤栨粌鍩屾繛瀛樼矌閸嬫捇骞堥妸銉庣喖鎮℃惔鈥茬帛闂備礁鎼鍐磹濡ゅ啯顫曢柟鐑橆殢閺佸﹦鐥幏灞煎惈闁告艾顑夊铏规嫚閳ヨ櫕鐏嶉梺鑽ゅ暱閺呯娀鐛崘顭戠叆闁稿繐澧介崰鏍箖閳╁啯鍎熼柨娑樺閸炲爼姊婚崒姘偓宄懊归崶顒夋晪鐟滃繘骞戦姀銈呯婵°倐鍋撶痪鍓х帛缁绘盯骞嬮悙鍨櫗濠电偛鎳愭繛鈧柡宀嬬畱铻ｅ〒姘煎灡閿涘棝姊洪幆褏绠伴柛妯荤矒瀹曟垿骞樼紒妯轰缓闂佹眹鍨婚崑锝夊焵椤掆偓閿曨亪寮诲☉姘ｅ亾閿濆骸浜濋悘蹇ｅ弮閺屽秶绱掑Ο璇茬３閻庤娲栫紞濠囥€佸▎鎾村仼閻忕偛鈧喐瀚梻鍌氬€搁崐椋庢濮橆剦鐒介柤濮愬€楃粈濠囨煕閵夈垺娅囩紒鈧繝鍋綊鏁愰崨顔藉枑闂佸搫妫撮梽鍕崲濞戞﹩鍟呮い鏃囧吹閻╁酣姊虹紒妯虹瑨闁诲繑宀告俊鐢稿礋椤栨氨顔婇悗骞垮劚椤︿即顢撻弽銊х閻庢稒顭囬惌瀣磼椤旇姤宕岀€殿喖顭烽幃銏ゅ礂閻撳簶鍋撶紒妯圭箚妞ゆ牗绻冮鐘裁归悩铏稇妞ゎ亜鍟存俊鍫曞川椤旂虎娲跺┑鐐茬摠缁姵绂嶉鍕靛殨閻犲洦绁村Σ鍫熸叏濮楀牏鍒板ù婊堢畺閺屻劌鈹戦崱妯烘濡炪倧绲界壕顓犳閹烘鐓㈤柍褜鍓熷畷鎴﹀箻缂佹ǚ鎷绘繛杈剧到閹诧繝骞嗛崼銉︾厸闁割偒鍋勬晶顕€鎮￠妶鍡曠箚妞ゆ牗鐟ㄩ鐔兼煕閵堝棭娈滈柡灞剧洴瀵挳濡搁妷褌鍝楁俊銈囧Х閸嬫垿宕归悜妯尖攳濠电姴娴傞弫宥嗙節闂堟稒顥滈柟顖滃仱閹嘲顭ㄩ崟顒傚嚒濠碘槅鍋呯换鍌烇綖韫囨洜纾兼俊顖濐嚙椤庢挻绻涢幘鏉戝毈闁搞劍濞婂畷婵堢矙濞嗙偓瀵岄梺闈涚墕濡鎮橀妷鈺傜厱濠电姴鍊绘禒銏°亜閺囶亞绉€殿喖顭锋俊鐑芥晝閳ь剚绂嶈ぐ鎺撶厽闁绘ê寮剁粚鍧楁倶韫囷絼閭鐐搭殜瀵挳濮€閳锯偓閹锋椽姊洪崷顓х劸婵炴挳顥撶划濠氬箻濞ｎ兛绨婚梺鎸庢椤曆囨倶閿濆洨纾兼い鏃傗拡閻撳ジ鏌℃担鐟板鐎垫澘瀚埀顒婄秵閸撴瑥顕ｉ搹顐ょ瘈闁汇垽娼ч埢鍫熺箾娴ｅ啿鍚樺☉妯锋瀻闁规儳纾弻鍫濃攽鎺抽崐鏇㈠箠韫囨稒鍋傛繛鍡樻尰閻撴洟鏌熼悙顒夋當闁瑰啿娴风划顓㈡晸閻樻枼鎷虹紓鍌欑劍钃遍悘蹇曞缁绘盯宕ｆ径灞解拰闂佺硶鏅濋崑銈夌嵁鐎ｎ喗鏅滈柦妯侯槷濮规姊绘担鍛婅础缂侇噮鍨抽弫顔界節閸曨喖小婵炲濮撮鍡涘煕閹寸姷纾藉ù锝堝亗閹寸姳鐒婃い鎾卞灪閻撳繘鏌涢銈呮瀾闁稿﹥鍔楅埀顒侇問閸犳牠鈥﹂悜钘夊瀭闁诡垎鍛闂佹悶鍎崝宥夋偩閻戣姤鈷戦悹鍥ㄥ絻閸よ京绱撳鍛棦鐎规洘绮岄埥澶愬閻樺疇绶㈤梻浣虹帛椤洨鍒掗鐐村亗闁挎繂鎮胯ぐ鎺戠闁兼祴鏅滈崳顕€姊洪崨濠傜瑐闁告濞婂濠氬即閵忕姴鑰垮┑鈽嗗灥濞咃綁鎮烽妸銉富闁靛牆楠告禍婵堢磼鐠囪尙澧︽鐐插暣閸╁嫰宕橀埡浣稿Τ闂備焦瀵х换鍌溾偓姘煎櫍瀵偊鎮欓鍌滅槇閻庡吀鍗抽弨鍗烆熆濮椻偓閸┾偓妞ゆ帊鑳舵晶鐢碘偓娈垮枛椤攱淇婇幖浣哥厸濞达絽鎼獮瀣⒒娴ｇ儤鍤€妞ゆ洦鍙冨畷鎴濃槈濮樺彉绗夐梺缁橆焽缁垶鍩涢幋鐘电＜閻庯綆浜滈惃锟犳煛閳ь剛绱掑Ο闀愮盎闂侀潧顭堥崕鏌ニ夐姀鈽嗘闁绘劘灏欐晶锕€鈹戦埄鍐╁€愰柛鈹惧墲閹峰懎煤椤忓棗绀堥梻鍌氬€风粈浣革耿闁秴纾婚柕濞炬櫅缁€澶屸偓骞垮劚閹峰銆掔拠瑁佸綊鎮╁顔煎壄闂侀€炲苯鍘哥紒鈧笟鈧敐鐐差煥閸繄鍔﹀銈嗗笒鐎氼剛绮婚弽銊х瘈濠电姴鍊绘晶鏇燁殽閻愵亜鐏ǎ鍥э躬椤㈡稑鈹戦崱鏇熺潖闂備礁鐤囬褔藝椤栫偛鐓橀柟杈鹃檮閸嬫劙鏌涢…鎴濅簼婵絽瀚板铏圭矙濞嗘儳鍓辩紓浣割儐閸ㄥジ鎮橀幒鎾剁瘈闁汇垽娼у瓭闂佸摜鍠嶉崡鎶藉Υ閸涙潙鐭楀璺虹灱閻﹀牊绻濋悽闈浶㈤柛濠傜秺瀹曡櫕绂掔€ｎ偆鍘藉銈嗘尵閸嬬偤藟閵忋倖鐓涢悘鐐插⒔閳藉鏌ｉ敐鍡欑疄闁糕斁鍋撳銈嗗笒鐎氼剛澹曟繝姘厽闁归偊鍠栭崝瀣煕鐎ｎ亜鈧潡寮婚敐澶婃闁割煈鍠楅崐顖炴⒑缂佹ɑ灏伴柣鐔叉櫊瀵鏁愭径濠勭杸闂傚倸鐗婄粙鎴︼綖閳哄懏鈷戠€规洖娲ㄧ敮娑欑箾閸欏鑰垮┑锛勬暬瀹曠喖顢楁担绋垮Τ闂備線娼х换鍡涘疾濠婂牊鍋╅柣鎴ｅГ閳锋垿姊婚崼鐔衡姇闁瑰吋鍔欓幃妤€顫濋銏犵ギ闂侀潧妫旂欢姘嚕閹绢喖顫呴柍鍝勫€瑰▍鍥⒒娴ｈ姤纭堕柛鐘虫尰閹便劎鈧稒顭囬々鐑芥煙闁箑骞樼紒鈾€鍋撴繝鐢靛仜閻楀棝鎮樺┑瀣嚑婵炴垯鍨洪悡銉╂煛閸ヮ煁顏堝礉濮橆厹浜滄い蹇撳閺嗙偟绱掗崒娑樼闁逞屽墾缂嶅棝宕滃▎鎴犵焾闁挎洖鍊归埛鎴︽煕濠靛棗顏柍璇差樀閺屾稑螣閸︻厾鐓撻悗瑙勬礃閸旀瑩骞冨鍫熷殟闁靛／鍐ㄧ缂傚倸鍊搁崐鐑芥倿閿曞倹鏅┑鐑囩到濞村倿宕归崼鏇炶摕闁挎繂妫欓崕鐔兼煏婵炲灝鈧牠宕板顑芥斀妞ゆ梻銆嬮崝鐔虹磼椤曞懎鐏︽鐐茬箻瀹曘劑寮堕幋婵堢崺濠电姷鏁告慨鎾磹閻熸壋鏋旀俊顖濐唺缁诲棝鏌ｉ幇鍏哥盎闁逞屽墯閸ㄥ灝鐣峰┑鍫滄勃閺夌偞瀵х粙鎴﹀煝鎼淬劌绠ｉ柣鎰絻缁ㄣ儲绻濋悽闈涗沪闁搞劌鐖奸幃鐤槾鐎殿啫鍥х劦妞ゆ帒瀚埛鎴︽煙閼测晛浠滈柛鏃€顨婇弻锟犲川椤斾勘鈧帞绱掗纭疯含闁轰礁鍟村畷鎺戔槈閹烘挸顏归梻鍌欑閹诧紕绮欓幋锔芥櫇闁靛牆妫欓崣蹇涙煥閺囩偛鈧綊鎮￠弴銏＄厽婵☆垵顕ф晶顖涚箾閸喓鐭岄柍褜鍓氶鏍窗濡ゅ懏鍋傞柨鐔哄Х瀹撲線鏌″鍐ㄥ濠殿垱鎸抽弻娑㈡晜鐠囨彃绠瑰Δ鐘靛仦椤ㄥ棛鎹㈠┑鍫濇瀳婵☆垱妞垮鎴︽⒑閹肩偛濡洪柛妤佸▕楠炲啫螣鐞涒剝鏂€闁诲函缍嗛崑鍕礈椤撶偐鏀介柣鎰级閳绘洖霉濠婂嫮绠為柟顕嗙節婵＄兘鏁傞崜褜鍟庨梻浣烘嚀椤曨參宕戦悢鐓庣疇闁告稑鐡ㄩ悡鐔搞亜閹捐泛鏋庣紒妤佸哺閺岀喐绗熼崹顔碱瀴缂備胶绮换鍫濈暦閵娾晩鏁嬮柛娑卞墮閹藉绱撻崒姘偓宄懊归崶銊ｄ粓闁告縿鍎查弳婊堟煙閻戞ɑ绀堝ù婊€绮欏缁樻媴閸涘﹤鏆堢紓浣筋嚙閸婂鍩€椤掍浇澹橀柛銏＄叀閳ワ箓宕堕鈧粻鑽ょ磽閸垹啸缂佺姵宀稿铏圭磼濡搫袝婵炲瓨绮嶇划鎾诲春閳ь剚銇勯幒宥堝厡濠⒀屼邯閹繝濡舵径瀣弳闂佸搫娲ㄩ崑娑㈠焵椤掍焦鍊愰柟顖氳嫰铻栭柛娑卞枤閸橀亶姊虹憴鍕棎闁哄懏绋掓穱濠囧锤濡や胶鍘搁梺绯曟閸橀箖鎮鹃悽鍛婄厸閻忕偟鍋撶粈澶岀磼閻樺磭娲村┑锛勬焿椤︽挳鏌ㄥ☉姘瀻妞ゎ亜鍟存俊鍫曞磼濞戞瑧褰囬梻浣侯焾缁绘垿鏁冮姀銈囧祦闁告劑鍓弮鍫濆窛妞ゆ棁濮ら悵鎶芥⒑绾懎浜归悶娑栧劦閸┾偓妞ゆ帒鍟惃娲煟閺嶎厺鎲炬慨濠勭帛閹峰懘宕ㄦ繝鍛攨闂備礁鎼懟顖炈囬鐐茬厺鐎广儱顦伴弲鏌ユ煕閵夘喚鍘涙繛鑲╁枛濮婅櫣鎲撮崟顐ゎ槰濡炪倖娉﹂崨顓ф闂佺绻楅崑鎰不妤ｅ啯鐓曢柍鈺佸幘椤忓牊鍊堕柕澶堝劗閺€浠嬫煃閵夈劌鐨洪柣顓熺懄閹便劍绻濋崘鈹夸虎濡ょ姷鍋為崝鏍箚閺冨牆顫呮い顐枤缁屽潡姊婚崒娆戭槮闁圭⒈鍋婇獮濠囧箛椤撶姷顔曢梺閫炲苯澧い銊ｅ劦閹瑩骞撻幒鎾搭啋闂備浇顕栭崰妤呮偡閳轰胶鏆︽い鎰剁畱缁€瀣亜閹捐泛校婵絽楠搁埞鎴︽晬閸曨偂鏉梺绋款焾閸婃繂鐣峰鍫澪╃憸搴綖閺囥垺鐓涢柛銉ｅ劚閻忊晝绱掗悩闈涒枅闁哄瞼鍠栧畷婊嗩槻闁告棑绠撻弻宥堫檨闁告挶鍔庣划濠氬箻缂堢姷绠氶梺褰掓？閻掞箓寮插鍫熺參婵☆垯璀﹀Σ绋库攽閳╁啫鈻曟慨濠勭帛閹峰懘宕崟顏嗙处闂備胶顭堢€涒晠鎮￠垾鎰佸殨闁告稑锕﹂梽鍕磼鐎ｎ厽纭舵い鏂挎椤啴濡堕崱妤€衼闂傚倸瀚€氫即骞冮敓鐘冲亜闁绘挸娴烽鎰攽閻戝洨绉甸柛鎾寸懇閸┾偓妞ゆ垶鍎抽埀顒佹礋閳ワ箓宕堕鈧粻娑欍亜閹捐泛啸妞ゆ梹娲熷娲川婵犲嫭鍣у銈忕細缁瑩骞冮悙瀵割浄閻庯綆鍋嗛崢闈浳旈悩闈涗粶闁诲繑绻堥幃姗€鎳犻钘変壕閻熸瑥瀚粈鍐偨椤栥倗绡€妤犵偛鍟…銊╁醇濠靛棜鈧灝鈹戦埥鍡楃仯缂侇噮鍨堕幃闈涒攽閸モ晝鐦堥梺姹囧灲濞佳囧煝閸喓绠惧ù锝呭暱濞层倗澹曢悷鎵虫斀闁绘ê鍟块悞褰掓煃瑜滈崜銊х不閹惧磭鏆﹀┑鍌滎焾鍞悷婊冪Ф缁﹪鏁冮崒娑掓嫼闂傚倸鐗婇惄顖炴偘濠婂懐纾奸弶鍫涘妽缁€鍫㈢磼椤斿墽甯涢柕鍫秮瀹曟﹢鍩￠崘銊ョ疄闂傚倷鐒﹂弸濂稿疾濞戙垹鍌ㄥΔ锝呭枤閺佸倿鏌涢銈呮瀻闁逞屽墮閻栧ジ寮诲澶婁紶闁告洦鍋€閸嬫挻顦版惔銏犲簥闂佺硶鍓濈粙鎺楁偂濞嗘垹纾藉ù锝咁潠椤忓棛绠旀慨妯垮煐閻撴洟鏌ｅΟ璇茬亣闁硅揪绠戠粻鐐烘煏婵犲繐顩紒鈾€鍋撻梻浣告啞濞诧箓宕㈤懖鈺冪當闁挎稑瀚壕钘壝归敐鍫殐婵炲牊锕㈤弻娑㈡偐瀹曞洤鈷岄悗瑙勬礃濡炰粙宕洪埀顒併亜閹哄秹妾峰ù婊勭矒閺岀喖宕崟顒夋婵炲瓨绮嶉崕鎶解€旈崘顔嘉ч幖绮光偓宕囶啇婵犵數鍋炵粊鎾疾閻樼儤顥ら梻浣告贡閾忓酣宕板Δ鍛亗婵炲棙鍔﹀▓浠嬫煟閹邦垰鐨哄ù鐘灲閺岋綀绠涘顒傛闂侀€炲苯澧叉い顐㈩槸鐓ら柡宓懏娈惧銈嗗笒鐎氀囧焵椤掍焦顥堢€规洘锕㈤、姘跺幢濞嗘垟妫ㄥ┑锛勫亼閸婃牠寮婚妸锔芥珷闁稿﹦鍟块崣娲⒒娴ｇ瓔鍤欐慨姗堢畵閿濈偞寰勬繛鎺楃細缁犳稑鈽夊Ο纰辨Х闂佺懓鍚嬮悾顏堝礉瀹€鍕€块柛顭戝亖娴滄粓鏌熼崫鍕ラ柛蹇撶焸閺屽秹顢涘☉娆戭槹闂佸搫琚崝宀勶綖濠靛鍤嬮柣銏ゆ涧鐢鏌ｉ悢鍝ョ煁缂侇喗鎸搁悾宄邦煥閸愶絾鐎婚棅顐㈡祫缁插潡宕濋悜鑺モ拺閻犳亽鍔岄弸鏂库攽椤旇姤灏﹂柟閿嬪灴閹垽宕楅懖鈺佸汲婵犵數濞€濞佳兾涢鐐嶏綀銇愰幒鎾跺幐闂佸憡渚楅崰姘跺矗閳ь剟姊洪崫鍕拱缂佸鍨块崺銉﹀緞閹邦剛顢呴梺缁樺姇閸氣偓闁告牗鐗曢埞鎴︽倷瀹割喖娈堕梺鍛婎焼閸忕姵妞芥俊姝岊槼妞ゎ偅娲熼弻鐔兼倻濮楀棙鐣烽梺绋匡躬閺€閬嶅Φ閸曨垰绠抽柛鈩冦仦婢规洟姊绘担鍛婂暈闁哄矉缍佸畷鎰攽鐎ｎ亣鎽曢梺鍝勬储閸ㄥ綊鏌嬮崶顒佺厪闊洤锕ュ▍鍥煕閺冨偆鐒炬い顏勫暣婵″爼宕卞Ο灏栨晬缂傚倸鍊哥粔宕囩矆娓氣偓閹箖鏌ㄧ€ｎ剟妾紓浣割儏閻忔繂鐣甸崱娑欌拺缂備焦锚婵洭鏌熺喊鍗炰喊鐎殿噮鍋嗛幉鎾礋椤撶姷妲囨繝鐢靛仜閻楀棝鎮樺┑瀣嚑闁绘柨鍚嬮悡銉╂煛閸ヮ煈娈曟繛鍛功閳ь剝顫夊ú蹇涘垂閾忓湱鐭夐柟鐑樻煛閸嬫捇鏁愭惔鈥茬盎婵炲濮嶉崶銊㈡嫼闂佸憡绻傜€氼剟寮虫繝鍥ㄧ厱閻庯綆鍋呯亸鐢电磼鏉堛劌绗х紒杈ㄥ笒铻ｇ紒妤勩€€閸嬫捇骞掑Δ浣哄帗閻熸粍绮撳畷婊冣槈閵忕姵鐎梺褰掓？鐠佹煡鍩€椤掑﹦鐣电€规洖銈搁幃銏ゅ传閸曘劌褰忕紓鍌氬€搁崐鎼佸磹閹间礁纾瑰瀣椤愪粙鏌ㄩ悢鍝勑㈢紒鎰殜閺屸€愁吋鎼粹€茬敖闂佹椿鍘介幑鍥箖瀹勬壋鏋庨煫鍥ㄦ惄娴犲湱绱撴担绛嬪殭婵☆偅绻堝濠氭晲婢跺娼婇梺闈涚箚閺呮繈宕濋崫銉х＝濞达絾褰冩禍楣冩煟鎼搭垳绉甸柛瀣╃劍缁傚秴顭ㄩ崼鐔哄幐閻庡箍鍎遍崯顐ｄ繆娴犲鐓熼柕濠忕畱閻忥箓鏌曢崶褍顏€殿噮鍣ｉ崺鈧い鎺戝€归弳婊堟煃閵夛箑澧繛鍏肩墬缁绘稑顔忛鑽ょ泿閻庣懓鎲＄换鍌炲煘閹达附鍋愰柟缁樺坊閸嬫捇骞栨笟濠勭◤閻庡厜鍋撻柛鏇ㄥ墮閳ь剙鐏氱换娑㈠醇濠靛牅铏庨梺鍝勵儐閻╊垶寮婚敐澶婂唨妞ゆ劑鍨规禒姗€姊烘导娆戞偧闁稿繑锕㈤悰顕€宕堕浣哄姺闂佹寧妫佹慨銈呪枍閺嶎厽鈷掑ù锝堟鐢盯鏌涢弮鈧悧鏇⑩€﹂崶褉鏋庨柟鎯х－閸旓箑顪冮妶鍡楃瑨闁稿﹤缍婂鎶筋敆閸曨剛鍘搁柣蹇曞仜婢ц棄煤閹绢喗鐓冮柕澶樺灣閻ｅ灚顨ラ悙宸剰闁宠鍨垮畷銊╊敍濮橆剚鐦撶紓鍌氬€搁崐鎼佸磹瀹勬噴褰掑炊椤掆偓閺勩儵鏌″搴″箺闁稿鍊块弻銊╂偄閸濆嫅銏㈢磼閻樺磭澧ǎ鍥э躬婵″爼宕掑顐㈩棜濠碉紕鍋戦崐銈夊磻閸涱垱宕查柛顐犲劚缁犳牠鏌嶉埡浣告殲闁稿海鍠栭弻銊モ槈濡警浼岄梺鍝ュ枎椤戝顫?/p>';
    return;
  }

  elements.terrainList.innerHTML = terrainObjects
    .map((terrainObject) => `
      <article class="item-card is-clickable ${isSelected("terrain", terrainObject.id) ? "is-selected" : ""}" data-terrain-card="${terrainObject.id}">
        <header>
          <div>
            <h3>${terrainObject.name}</h3>
            <small>${terrainTypeLabel(terrainObject.terrainType)} / ${terrainObject.coordSystem || "-"}</small>
          </div>
          <span class="badge ok">${terrainObject.source || "manual"}</span>
        </header>
        <p>${formatTerrainRange(terrainObject)}</p>
        <p>${terrainObject.meshRef || terrainObject.heightmapRef || terrainObject.textureRef || terrainObject.notes || "No terrain reference"}</p>
      </article>
    `)
    .join("");
}

function terrainTypeLabel(type) {
  if (type === "site") {
    return "Site";
  }
  if (type === "surface") {
    return "Surface";
  }
  if (type === "corridor") {
    return "Corridor";
  }
  if (type === "foundation") {
    return "Foundation";
  }
  if (type === "reference") {
    return "Reference";
  }
  return type || "-";
}

function formatOptionalMetric(value) {
  if (value == null || value === "") {
    return "-";
  }
  return formatMetric(value);
}

function formatTerrainRange(record) {
  const hasBBox = [
    record.bboxMinX,
    record.bboxMinY,
    record.bboxMinZ,
    record.bboxMaxX,
    record.bboxMaxY,
    record.bboxMaxZ,
  ].some((value) => value != null && value !== "");

  if (hasBBox) {
    return `bbox [${formatOptionalMetric(record.bboxMinX)}, ${formatOptionalMetric(record.bboxMinY)}, ${formatOptionalMetric(record.bboxMinZ)}] -> [${formatOptionalMetric(record.bboxMaxX)}, ${formatOptionalMetric(record.bboxMaxY)}, ${formatOptionalMetric(record.bboxMaxZ)}]`;
  }
  return "No notes";
}

function resetTerrainForm() {
  elements.terrainForm.reset();
  elements.terrainType.value = "site";
  elements.terrainCoordSystem.value = "local";
  elements.terrainSource.value = "manual";
}

const __originalGetSelectedRecord = getSelectedRecord;
getSelectedRecord = function getSelectedRecordOverride() {
  if (selectedDetail?.kind === "terrain") {
    return (state.terrainRawObjects || []).find((item) => item.id === selectedDetail.id) || null;
  }
  if (selectedDetail?.kind === "terrainChange") {
    return (state.terrainChangeSets || []).find((item) => item.id === selectedDetail.id) || null;
  }
  return __originalGetSelectedRecord();
};

const __originalKindLabel = kindLabel;
kindLabel = function kindLabelOverride(kind) {
  if (kind === "terrain") {
    return "Terrain";
  }
  return __originalKindLabel(kind);
};

const __originalRenderSummary = renderSummary;
renderSummary = function renderSummaryOverride() {
  __originalRenderSummary();
  if (!elements.summaryCards) {
    return;
  }
  const terrainCount = state.terrainRawObjects?.length || 0;
  if (elements.summaryCards.textContent.includes("Terrain")) {
    return;
  }
  elements.summaryCards.insertAdjacentHTML(
    "beforeend",
    `
      <div class="summary-card">
        <span>闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煃闁垮鐏撮柡宀嬬秮閹垽宕ㄦ繝鍕殥闂備焦濞婇弨鍗烆潖閼姐倖顫曢柟鐑橆殢閺佸鏌涘☉鍗炲箻濞寸姵鎮傞幃妤冩喆閸曨剛顦ㄩ梺鎼炲妼濞硷繝鎮伴鈧畷鍫曨敆婢跺娅嶆繝鐢靛Т鑹岄柛瀣尵缁辨帡濡搁妷顔惧悑濠殿喖锕紓姘跺Φ閹版澘绠抽柟瀛樼矊閺嬪牓姊绘担鍛婃喐濠殿喚鏁婚幃褔鎮╁顔兼闂佸憡绋戦敃銉╁磿閻斿吋鐓冩い鎾跺仜椤ｆ娊鏌熼搹顐ｅ磳闁炽儻绠撴俊鎼佸煛娓氣偓閸炲爼姊洪棃娑氱疄闁搞劌鎼闁搞儺鍓氶埛鎺懨归敐鍛暈闁诡垰鐗撻幃璺侯潩閻撳簼鍠婇悗瑙勬礃缁诲牓鐛€ｎ亖鏀介柟閭﹀墯椤撳潡姊绘担鍛婅础闁惧繐閰ｅ畷鏉课旈崨顓狅紮闂備礁鐏濋鍥╃不妤ｅ啯鐓涘璺侯儏閻掗箖鏌涙惔锛勭闂囧绻濇繝鍌滃ⅱ闁伙絾妞介弻鈥崇暆閳ь剟宕伴弽褜娼栭柤濮愬€愰崑鎾绘偨濞堣法鍔告繝纰樷偓鑼煓婵﹨娅ｇ划娆撳礌閳ュ厖绱ｉ梻浣规偠閸ㄦ椽鎮￠敓鐘叉槬闁绘劕鎼粻锝夋煥閺冨洦顥夊ù婊冪秺濮婃椽宕烽鐘茬闁汇埄鍨遍〃鍛村煝閹捐妲肩紓浣虹帛缁嬫捇鍩€椤掍胶鈯曟い顓炴喘閹瞼鈧綆鍓涚壕鍏笺亜閺冨洤袚鐎规洖鐬奸埀顒侇問閸犳牠鈥﹂悜钘夌畺闁靛繈鍊栭崑鍌炲箹鐎涙绠橀柣鎰躬濮婄粯鎷呴崨濠傛殘濠电偠顕滅粻鎾崇暦濠婂牊鏅濋柍褜鍓濋悘瀣⒑缂佹ê濮囨い鏇ㄥ幘缁粯銈ｉ崘鈺佲偓鍨箾閹寸偟鎳愰柣鎺嶇矙閺岋綁顢橀悜鍥т紣濡炪値鍙€閸庡藝閹绢喗鐓涢柛婊€绀佹禍婊堝础闁秵鐓欓柣妤€鐗婄欢鑼磼閻樺樊鐓奸柟顔筋殔閳藉鈻嶉褌閭い銏℃崌楠炴绱掑Ο閿嬪闂備胶鍘ч～鏇㈠磹閺囥垹鍑犻柟瀵稿仧缁♀偓闂侀潧绻嗗Σ鍕嚀閸ф鐓ユ繝闈涚墕娴犳粍銇勯幘鐐藉仮鐎规洦浜濋幏鍛存偡閹殿喗袙闂傚倸鍊风欢姘焽瑜旈幃褔宕卞☉妯兼焾濡炪倖鍔х徊鑲╂崲閸℃せ鏀介柛灞剧閸熺偤鏌ｉ幘鍗炲姦闁哄矉绻濆畷鍫曞Ψ閵夈儺鐎遍梻鍌欑贰閸欏酣宕归崼鏇炶摕闁绘梻鈷堥弫濠囨偣閸ャ劌绲荤紒渚囧枛椤啴濡堕崘銊т痪閻庡厜鍋撻柟闂寸閺勩儵鏌嶈閸撴岸濡甸崟顖氱闁糕剝銇炴竟鏇熶繆閻愵亜鈧牕煤閳哄啫绶ら柛鎾楀懐鐒块梺鍦劋閺岋繝宕戦幘缁樻櫜闁告侗鍨划鐢告⒑閸濆嫭瀚呯紓宥勭椤繘鎼归崷顓狅紲濠碘槅鍨伴幖顐︼綖瀹ュ拋娓婚柕鍫濇閳锋劙鏌ｅΔ鍐ㄐ㈤柣锝囧厴椤㈡盯鎮欓懠顒€鈧偤姊洪棃娑辩劸闁稿﹥顨堢划璇差潩閼哥鎷虹紓鍌欑劍閿氬┑顕嗙畱闇夋繝濠傚閻帡鏌涢埞鎯т壕婵＄偑鍊栫敮濠囨嚄閼稿灚娅犻柛顭戝亽濞堜粙鏌ｉ幇顓熺稇濠殿喖绉归弻鐔碱敊閻ｅ本鍣板銈冨灪椤ㄥ棝骞忛崨顖滅煓濠㈣泛鎽滅粈瀣⒒閸屾瑦绁版い鏇嗗洦鐓€闁挎繂鎷嬮悞鐣屾喐閺冨牏宓佸鑸靛姈閺呮悂鏌ｅΟ鍝勭骇閺夊牆鐗嗛埞鎴︽偐鐠囇冧紣闂佺粯顨呴敃顏堝箖闄囩粻娑㈠箻椤栨稒鏉搁梻浣虹帛閸旀牠宕归悽绋跨柈妞ゆ牜鍋涢梻顖毭归悩宸剱闁绘挶鍎茬换娑㈠箣閻愬灚鍣紓浣哄Х閸嬬偤骞堥妸锔剧瘈闁告侗鍣禒鈺冪磽娓氬洤鏋熼柣鐔叉櫊閻涱噣骞囬鐔峰妳闂侀潧绻嗛埀顒佸墯娴煎棙绻濋悽闈浶ｆい鏃€鐗犲畷鏉课旈崟顐ょ☉闂傚倷绀侀幉锟犲蓟閵娧呯煋鐟滅増甯掔粻鏍喐鎼淬劌绠氶柡鍐ㄧ墕鎯熼梺鎸庢椤鈧俺妫勯埞鎴︽倷閼搁潧娑х紓鍌氱М閸嬫挸鈹戦悙鍙夊珔缂佹彃娼″顐︻敊鐏忔牗顫嶅┑鐐叉缁夊磭鑺辨繝姘拺闂傚牊渚楅悞楣冩煕鎼淬倖鐝柡鍛版硾閳藉顫濇潏鈺嬬床缂傚倸鍊烽悞锕傗€﹂崶顬℃椽骞橀鐣屽幈闂佸疇顫夐崕铏閻愵兛绻嗛柣鎰典簻閳ь剚鐗滈弫顕€骞掑Δ鈧壕褰掓煟閵忋埄鐒剧痪鎯ь煼閺岀喖鎮欓浣轰紘闂佸搫顑嗗Λ鍐蓟濞戔懇鈧箓骞嬪┑鍥╀憾闂備浇顕х换鎰版偋閸℃稈鈧棃宕橀鍢壯囧箹缁厜鍋撳畷鍥跺晪闂傚倷鑳堕…鍫㈡崲閹达附鏅濋柕蹇嬪€栭崑妯汇亜閺囨浜鹃悗瑙勬礃閿曘垽銆佸▎鎴濇瀳閺夊牄鍔庣粔閬嶆⒒閸屾瑧绐旀繛浣冲洦鍋嬮柛鈩冪☉缁犵娀鏌熼弶鍨絼闁搞儺浜跺Ο鍕攽椤旂》榫氭繛鍜冪悼濡叉劙骞掗幊宕囧枔閹风娀鎳犻澶嬫缂傚倸鍊搁崐鐑芥⒔瀹ュ绀夐煫鍥ㄧ☉绾惧鏌熼柇锕€鏋熸い顐ｆ礋閺岋繝宕橀妸褍顣洪梺鍛婎殕婵炲﹪寮婚弴锛勭杸濠电姴鍠氶埀顒€妫濋弻鐔割槹鎼达絽绗＄紓浣虹帛缁嬫帒顭囪箛娑樼鐟滃酣宕戣椤啴濡舵惔鈥崇闂佺粯顨嗛幑浣肝涢姀銈嗩棅妞ゆ劑鍨烘径鍕磼鐎ｎ偄娴柟顕嗙節瀵挳濮€閳ユ枼鍋撻悽鍛婄叆婵犻潧妫涢崙鍦磼閵娿儱鎮戦柕鍥у婵＄兘鏁愰崨顖欑磿闂備線鈧偛鑻晶鍙夈亜椤愩埄妲搁悡銈夋煙鏉堝墽鐣辩痪顓涘亾闂備胶鎳撴晶搴ㄥ疾椤愩垻鏆ゅù锝夆偓娑氱畾濡炪倖鐗楅懝楣冨箖閹达附鍊垫慨姗嗗幖閸濇椽鏌＄仦璇测偓妤呭窗婵犲洤纭€闁绘劖绁撮幏缁樼節绾版ê澧查柣鎾墲缁傚秶鎹勬笟顖涚稁缂傚倷鐒﹁摫濠殿垱鎸抽弻銈夊箒閹烘垵濮㈤梺闈涙閿曨亜顫忓ú顏勪紶闁靛鍎涢敐澶嬬厵缂佸顑欓悡鍏碱殽閻愯尙澧﹀┑鈩冩倐閸╋繝宕掑顐ょ处缂傚倸鍊风粈渚€顢栭崼婵冩灃闁哄洢鍨归崒銊╂⒑椤掆偓缁夌敻鍩涢幋鐘垫／妞ゆ挾鍋為崳铏规喐閹跺﹤娲﹂埛鎺楁煕閺囥劌浜滄い蹇ｅ弮閺岀喖顢氶崱娆戠槇閻庢鍠楅幐铏叏閳ь剟鏌ㄥ☉妯侯仼鐎殿喗濞婂缁樻媴閸涘﹥鍎撻梺鍝ュ櫏閸嬪嫰婀侀梺绋跨灱閸嬫盯宕ョ憴鍕闁糕剝锚婵附绻涢崼婊呯煓闁哄矉缍侀獮鍥敇閻斿嘲澹掓繝鐢靛仜閻楀﹦鍒掗幘璇茶摕闁挎稑瀚▽顏堟煕閹炬瀚崹鍗炩攽閻樻鏆柍褜鍓欑壕顓㈠春閿濆洠鍋撶憴鍕閻㈩垱甯￠敐鐐测攽鐎ｅ灚鏅濋梺闈涚箚閺呮粓藟閿熺姵鈷掗柛灞捐壘閳ь剚鎮傚畷鎰板箹娴ｅ摜锛欓梺褰掓？缁€浣哄瑜版帗鐓熼柟杈剧到琚氶梺鎼炲€曠€氫即寮诲☉銏犵闁肩⒈鍓﹀Σ顕€姊洪幖鐐插缂佽鍟存俊鐢稿礋椤栨艾鍞ㄥ銈嗗姦濠⑩偓婵炲矈浜铏圭矙濞嗘儳鍓板銈嗗灥椤﹂潧顕ｆ繝姘櫢闁绘灏欓崐鐐烘⒑闂堟侗妲堕柛搴ゆ珪缁傛帗绺介崨濠勫幈闂侀潧顦崕娲吹閻旇櫣纾奸弶鍫涘妽鐏忎即鏌熷畡鐗堝殗鐎规洘绮撻獮鎾诲箳閹存繍妫婃繝纰夌磿閸嬫垿宕愰弽顓炲瀭闁割偅娲橀崑锟犳煃鏉炴媽鍏岄柡鍡畵閺岋綁濮€閵忊晝鍔搁梺鍛婎殕婵炲﹪寮婚敐澶婄疀闁靛闄勯悵鏇㈡⒑閸濆嫬鈧敻宕戦幘缁樷拻闁稿本鐟ㄩ崗宀€绱掗鍛仸闁轰礁顑夊鍝勑ч崶褉鍋撻弴鐏绘椽鏁傞崜褍宕ラ梺缁樻煥椤ㄥ骸顭囬妸鈺傜厓鐟滄粓宕滈悢濂夊殨濠电姵纰嶉弲鎻掝熆鐠虹尨鍔熸い鏂匡躬濮婃椽宕烽鐐板闂佷紮缍嗘禍婵堢矉閹烘顫呴柕鍫濇閹锋椽姊洪崨濠勭畵閻庢凹鍘奸敃銏″鐎涙鍘介梺鍐叉惈閿曘倝鎮橀敃鍌涚厽婵炴垵宕▍宥団偓瑙勬礀閻栧ジ銆佸Δ鍛劦妞ゆ帒瀚崑鍌涚箾閹寸偐妫ㄧ憸鐗堝笚閺呮煡鏌涘☉鍗炲季婵☆偄鐭傚铏规嫚閺屻儱寮板銈冨劜閹告儳危閹版澘绠婚悹鍥皺閿涙粌鈹戦悙鍙夘棡闁搞劌鐏氭穱濠冪鐎ｎ偀鎷洪梺鍛婄☉閿曘儵鍩涢幇顓滀簻闁靛鍎诲銉╂煟閿濆洤鍘存鐐差儔閺佸啴鍩€椤掆偓濞插灝鈹戦悩顔肩伇婵炲鐩弫鍐Ω閳轰胶顔戦梺鍝勬储閸ㄦ椽鍩涢幋鐘电＝濞达綀鍋傞幋锔藉亗闁靛鏅滈悡鏇熸叏濮楀棗澧婚柛搴㈡⒒閳ь剝顫夊ú婊堝极鐠囪尙鏆︽慨妞诲亾妞ゃ垺鐟╅幃鍓т沪閽樺鐟查梻鍌氬€风粈渚€骞夐敍鍕床闁稿本澹曢崑鎾愁潩閻撳骸鈷嬪銈冨灪閹告悂锝炲┑瀣垫晢濠㈣泛鑻弫鎼佹⒒娴ｇ鎮戦柟顔煎€搁…鍥槼闁逛究鍔戝畷濂稿Ψ閿旀儳骞楅梻浣筋潐閸庢娊宕崸妤€姹查柣鏂垮悑閻撴瑩鏌ょ喊鍗炲⒒闁绘帞鍋撻妵鍕敇濠婂啫顫囬悗瑙勬礈閸樠囧煘閹达箑閱囨い鎰跺強閵堝應鏀介柣妯虹仛閺嗏晠鏌涚€ｎ偆鈽夐摶鐐寸箾閸℃ɑ灏紒鐘卞嵆閺岀喖姊荤€电濡介梺绋款儛娴滄繈濡甸崟顖氬嵆婵°倐鍋撳ù婊堢畺濮婃椽宕崟顒佹嫳闂佺儵鏅╅崹鍫曞垂妤ｅ啯鏅濋柛灞炬皑椤撳搫鈹戦悩缁樻锭婵炲眰鍔嶇粋宥夋嚋閻㈢數鐦堝┑鐐茬墕閻忔繂鈻嶅▎鎴犵＜闁肩⒈鍓氬▍鏇㈡煃瑜滈崜姘卞枈瀹ュ拋鐔嗘慨妞诲亾闁?/span>
        <strong>${terrainCount}</strong>
      </div>
    `,
  );
};

const __originalRenderDetailPanel = renderDetailPanel;
renderDetailPanel = function renderDetailPanelOverride() {
  if (selectedDetail?.kind === "terrain") {
    const record = getSelectedRecord();
    if (!record) {
      elements.detailPanelContent.innerHTML = '<p class="empty-state">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈嗙節閳ь剟鏌嗗鍛姦濡炪倖甯掗崐褰掑吹閳ь剟鏌ｆ惔銏犲毈闁告瑥鍟悾宄扮暦閸パ屾闁诲函绲婚崝瀣уΔ鍛拺闁革富鍘奸崝瀣煕閵娿儳绉虹€规洘鍔欓幃娆撴倻濡桨鐢绘繝鐢靛Т閿曘倝宕幍顔句笉闁煎鍊愰崑鎾斥枔閸喗鐏嶆繝鐢靛仜閿曨亜顕ｉ锕€绀冩い鏃囧亹閿涙粌鈹戦悙鏉戠仸闁煎綊绠栭悰顔嘉旈崨顔规嫽婵炴挻鍩冮崑鎾寸箾娴ｅ啿鎳忓畷鏌ユ煕椤愮姴鍔氶柡鍕╁劦閺屾盯寮撮妸銉т画闂佺锕ゅ锟犲蓟濞戙垹绠绘俊銈傚亾闁硅櫕鍔欓弫宥咁煥閸啿鎷洪悷婊呭鐢帗绂嶆导瀛樼厱婵炲棗绻橀妤呮煃缂佹ɑ灏い顓滃姂瀹曞ジ鎮㈤崫鍕闂佽楠搁崢婊堝磻閹剧粯鐓冪憸婊堝礈閻旈鏆﹀ù鍏兼綑閸愨偓濡炪倖鎸鹃崑鐘诲箺閺囥垺鈷戦柟鑲╁仜閸旀挳鏌涢幘鏉戝摵鐎殿喗褰冮埞鎴犫偓锝庡亞閸樻捇鎮峰鍕煉鐎规洘绮撻幃銏＄附婢跺﹥顓跨紓鍌欑椤戝懐鑺遍崡鐐嶏綁宕奸妷锔惧帾闂婎偄娲㈤崕宕囧閸ф鐓曟慨妞诲亾濞存粏娉涢～蹇撁洪鍜佹濠电偞鍨兼禍顒勫矗濮橆厾绡€缁剧増菤閸嬫捇鎼归銏㈢崺缂傚倷绶￠崰鏍€﹂悜钘夌畺婵炲棙鎸哥粻瑙勩亜閹捐泛娅忛柛鐔风Ч濮婄粯鎷呴搹鐟扮闂佸憡姊瑰ú鐔笺€佸棰濇晣闁绘柨鎲￠悵宄邦渻閵堝懐绠伴柣妤€锕畷鐢稿即閵忥紕鍘甸梻渚囧弿缁犳垿鐛幋婢濈懓顭ㄩ崟顓犵厜闂佸搫鐬奸崰鏍х暦椤愶箑绀嬫い鎺戭槹椤ワ絽鈹戦悙鑼憼缂侇喗鎸剧划濠氬冀瑜滃鏍煣韫囨凹娼愰悗姘哺閺屾稑鈻庤箛锝喰ㄥ銈傛櫇婢ф鎹㈠☉姘ｅ亾濞戞瑯鐒介柣顓烆儑缁辨帞鎷犻幓鎺濅純濡ょ姷鍋為崹鎸庢叏閳ь剟鏌ｅ鍡椾簼妞ゎ偄绉瑰娲濞戞氨顔婃繝娈垮枛椤曨厾鍒掗敐鍛婵妫欑€靛矂姊洪棃娑氬婵☆偅绋掗弲鍫曨敆娴ｅ吀绨婚梺鍝勬川閸犳劗浜搁敃鍌涚厸濞达絿鎳撴慨宥団偓瑙勬磸閸庨潧鐣峰鈧濠氬Ψ閵夈儱寮烽梺璇叉唉椤煤濮椻偓瀹曟洘绺介崲搴涘姂瀹曟帡鎮欓幖顓燁棅婵＄偑鍊栫敮鎺椝囬娑欐珷妞ゆ洍鍋撻柡灞界Ф閹叉挳宕熼銈勭礉闂備焦鎮堕崝宥夊磿閹惰姤鍋╅柣鎴ｆ閻愬﹦鎲歌箛娑樺偍濞寸姴顑嗛悡鐔煎箹濞ｎ剙鈧倕顭囬幇顓犵闁圭粯甯炵粻鑽も偓瑙勬礃缁诲牓鐛€ｎ喗鏅滈悶娑掆偓鍏呭婵炶揪绲跨涵鍫曞几鎼淬劍鐓欓柟顖嗗拑绱炲銇礁鎳愮壕濂告煟閹伴潧澧紒鎯板皺閹叉悂寮跺▎鐐枅閻庤娲﹂崑鍕亙闂佸憡鍔︽禍鐐烘晬濠靛鈷戠紒瀣濠€浼存煠瑜版帞鐣洪柛鈹惧亾濡炪倖甯婇悞锕傚磹閹邦喒鍋撶憴鍕闁告梹鐟╅獮鍐煥閸喎娈熼梺闈涱槶閸庢煡鎮鹃柆宥嗏拻濞达綀妫勬禍瑙勩亜椤撶偟澧﹂柟顔矫～婵堟崉閾忓湱鍘梻濠庡亜濞诧妇绮欓幒妤佸亗婵炲棙鎸婚悡娆愩亜閺嶃劎鐭婃い锝呭悑閵囧嫰濡烽妷顔叫ㄩ梺姹囧労娴滎亪銆佸Ο琛℃婵☆垳鎳撻ˉ姘舵⒒閸屾艾鈧悂宕愬畡鎳婂綊宕堕濠勭◤婵犮垼鍩栭崝鏇犲閸ф鐓熼柟鎯у暱椤斿倹绻涢幋娆忕仼缂佲偓鐎ｎ偁浜滈柡宥冨妿閳藉鏌ｅ┑鍥棃婵﹨娅ｇ槐鎺懳熼懡銈呭汲闂備胶顢婃慨銈囧垝鎼达絽鍨濈紓浣骨滈崑鍛存煕閹般劍娅囬柛妯兼暬閺岋絾鎯旈敐鍡樻瘎濡炪値鍘奸悧鎾诲春閳ь剚銇勯幒宥囶槮闁诲繈鍎查妵鍕敃閿濆洨鐤勫銈冨灪閻楃娀宕洪敍鍕ㄥ亾閿濆骸澧扮悮锕傛煟鎼淬値娼愭繛鍙夌墵婵″爼骞栨担鍝ョ暫闂侀潧绻堥崹濠氭儗濞嗘挻鐓曟い顓熷灥閺嬫瑧绱掓潏鈺佹瀻闁宠鍨块幃鈺呮嚑椤掍緡妫勯梻浣告惈椤︻垳鑺遍柆宥呯；闁规崘顕х粻娑㈡煛婢跺孩纭堕柨娑欑洴濮婃椽鎮烽弶搴撴寖缂備緡鍣崹鍫曞箖閿熺姵鍋勯梻鈧幇顔剧暰闂備線娼ч悧鍡涘磹閸涘﹦顩插Δ锝呭暞閳锋垿鏌熺粙鍨劉濠㈣泛瀚湁婵犲﹤瀚惌鎺撱亜閵忊€冲摵闁轰焦鍔栧鍕熺紒妯荤彇闂傚倷鐒︾€笛兠哄澶婄；闁规儳澧庣壕濂告煟濡寧鐝柣銊﹀灴閺岀喖骞撻幒鎾虫殘閻庡灚婢樼€氫即鐛崶顒夋晢闁稿本纰嶉幉銏＄節閻㈤潧浠滄い鏇ㄥ幗閹便劑骞橀鍛櫈闂佺硶鍓濈粙鎺楀磻閸岀偞鐓熼柡鍌氱仢閹垿鏌ｉ幘瀵告噰婵﹥妞介、姗€濡歌閺嗙姵绻濋埛鈧仦鑺ョ亾缂備浇椴哥敮锟犲箖椤忓嫧鏋庨煫鍥ㄦ煥椤︹晠姊虹紒妯诲鞍婵炶尙鍠栧濠氬Ω閵夈垺鏂€闂佺硶鍓濋悷銉┞烽埀顒佷繆閻愵亜鈧垿宕曢柆宓ュ洭鎮界粙鑳憰閻庡箍鍎卞ú锕傚窗閸℃稒鐓曢柡鍥ュ妼娴滅偛霉閻撳海鐒告慨濠呮閹风娀鍨鹃搹顐や憾闂備浇宕甸崯鍧楀疾閻樿尙鏆︽繛宸簻閻掓椽鏌涢幇銊︽珔妞ゅ孩鎹囬幃妤呮偡閺夋浼冮梺绋款儏閿曘倛鐏嬪┑鐘诧工閻楀﹪鍩涢幒妤佺厱閻忕偞宕樻竟姗€鏌嶈閸撴岸骞冮崒姘辨殾闁归偊鍙庡Σ褰掑箹鏉堝墽鎮奸柣鎺戝悑缁绘盯骞橀弶鎴犲姲闂佺顑嗛幐濠氥€冮妷鈺傚€烽悗鐢殿焾閳峰苯顪冮妶鍐ㄧ仾婵炶尙鍠栧顐﹀磼閻愭潙鐧勬繝銏ｆ硾閿曘倝藟濡や胶绡€闁汇垽娼цⅷ闂佹悶鍔庨崢褔鍩㈤弬搴撴闁靛繆鈧櫕顓烘俊鐐€栭悧妤冨垝瀹ュ鏁冨ù鐘差儐閻撳繘鏌涢锝囩婵℃彃缍婇弻锝夊箻鐎涙顦ラ梺瀹狀潐閸ㄥ潡骞冮埡鍛闁圭儤绻€閹綁姊绘担鍛婃儓妞ゆ垵妫濆濠氬Ω閳哄倻鐣冲┑鐘垫暩婵澧濋梺绋款儐閹稿墽妲愰幒妤婃晩闁伙絽鏈崳褍顪冮妶搴′簻缂佺粯甯炲Σ鎰板箳閹冲磭鍠撻幏鐘差啅椤旂懓浜鹃柟鍓х帛閳锋垿鏌涘☉姗堝姛缂佺姵鎹囬幃妤€顫濋悡搴☆潽缂備礁鍊圭敮鎺曠亽婵炴挻鍑归崹杈┾偓闈涚焸濮婃椽妫冨☉姘暫婵°倗濮撮幉锛勭矉瀹ュ應鏀介柛銉㈡櫇椤旀洟姊洪懖鈹炬嫛闁告挻鐟╁鍛婃償閵婏妇鍘介梺鎸庣箓濞层倝宕㈢€涙﹩娈介柣鎰级閸犳鈧鍠栨晶搴ㄥ箲閸曨垪鈧箓骞嬪┑鍥р偓娑㈡⒒閸屾艾鈧兘鎮為敂閿亾缁楁稑鍘鹃崫鍕靛悑濠㈣泛锕﹂敍娑㈡⒑鐟欏嫬鍔ゅ褍楠歌灋妞ゆ牜鍋為悡娆愩亜閺嵮勵棞闁活剙銈稿畷銉р偓锝庡枟閳锋垿鏌涘┑鍡楊伀闁绘帟娉曠槐鎾愁吋閸曨厾鐛㈤梺缁樹緱閸ｏ絽鐣烽崼鏇ㄦ晢濠㈣泛顑嗗▍鎾绘⒒娴ｈ櫣甯涢柟绋挎啞椤ㄣ儵骞栨担娴嬪亾閺嶎厼骞㈡繛鎴炵憿閹风粯绻涙潏鍓ф偧闁硅櫕鎹囬崺銏ゅ即閵忥紕鍘搁梺閫炲苯澧撮柡灞芥椤撳ジ宕ㄩ鐘亾椤撱垺鈷戠紒澶婃鐎氬嘲鈻撻弮鍫熺參闁告劦浜滈弸鎴犵磼缂佹娲存鐐差儔閹瑩宕橀埡浣告懙閻庢鍠撻崝宥囩矉閹烘柡鍋撻敐搴′簽闁告﹢浜跺娲棘閵夛附鐝旈梺鍝ュУ閼归箖鍩㈤幘璇差潊闁绘ê妫楀﹢杈ㄧ閹间礁鍐€鐟滃本绔熼弴銏♀拻闁稿本鑹鹃埀顒佹倐瀹曟劙鎮滈懞銉ユ畱闂佸憡鎸风粈渚€宕瑰┑鍥ヤ簻闁哄秲鍔庨惌瀣煛閸℃鐭掗柡宀嬬秮瀵剛鎹勯妸锔诲敻闂備礁鎼鍡涙偋閻樿钃熼柨鐔哄Т閻愬﹪鏌嶆潪鎵偧闁挎繂妫庢禍婊勩亜閹板墎绋荤紒鈧€ｎ喗鐓涚€光偓閳ь剟宕伴弽顓炵畺婵犲﹤鍠氬銊╂煕閳╁喚鐒介柡鍡畵濮婄粯鎷呮笟顖滃姼濡炪倖鍨靛Λ婵嗙暦濠靛棌鏋庨柟鎯х枃閹芥洟鎮峰鍕仼缂侇喛顕ч埥澶愬閳╁啯鐝抽梻浣告啞娓氭宕滃☉銏″剮閹艰揪绲跨壕钘壝归敐鍥剁劸闁抽攱妫冮弻娑氣偓锝庡亝鐏忔壆绱掔紒妯尖姇缂佺粯绻堝畷鎯邦槾闁伙絽鎼埞鎴炲箠闁稿﹥鍔欏畷鎴﹀箻缂佹鍘撶紓鍌欑劍钃辩€规洖鐬奸埀顒冾潐濞叉牜绱炴繝鍥モ偓浣糕枎閹炬潙浠奸柣蹇曞仩閸嬫劙鎯屽顓犵瘈缁炬澘顦辩壕鍧楁煕鐎ｎ偄鐏寸€规洘鍔欏鍊燁槷闁哄鐗犻弻銊╁即閻愭祴鍋撻幖浣瑰€峰┑鐘叉处閻撶姷绱掔€ｎ厽纭跺ù鐘崇⊕缁绘盯宕ㄩ鐘樠勬叏婵犲嫮甯涢柟宄版噺缁楃喖顢涘鍐ㄐ紓鍌氬€烽懗鍓佸垝椤栨粍鏆滈柍銉ョ－閺嗭箓鏌曡箛銉хУ婵″弶鍎抽埞鎴︽倷閸欏妫戦梺鎼炲妺缁瑩鐛崘銊㈡瀻鐎电増绻傚﹢閬嶅焵椤掑﹦绉甸柛瀣嚇瀵爼骞栨担鍏夋嫽婵炶揪缍€濞咃絿鏁☉銏″珔閺夊牃鏅滈崰鎰版煛婢跺﹦浠㈤柡鍡稻閵囧嫰濮€閳╁喚妫冮梺绯曟櫔缁绘繂鐣烽幒妤€围闁糕檧鏅涢弲顒勬⒒閸屾瑨鍏岀紒顕呭灦瀹曟繈寮借閻掕姤绻涢崱妯哄闁告瑥绻橀弻娑㈠Ψ椤旂厧顫梺缁樻尭閸熸挳骞冨畡鎵虫瀻闊洦鎼╂禒濂告⒑鐠囪尙绠查柟鍛婂▕瀵鎮㈢喊杈ㄦ櫓闂佷紮绲介張顒勫闯娴煎瓨鈷戠痪顓炴噺閻濐亞绱掗鑺ュ碍閾荤偤鏌涢幇鈺佸Ψ婵℃彃鐗婄换娑㈠幢濡闉嶉梺鍝勬椤洨妲愰幘璇茬＜婵﹩鍏橀崑鎾诲箹娴ｅ摜锛欓悗鐟板閸ｇ銇愰幒鎴犲€為悷婊勭矒瀹曠敻寮撮姀锛勫幍闂佺顫夐崝鏍兜妤ｅ啯鐓曢柕濠忓缁犳牜绱掔紒妯兼创鐎规洖宕灒閻犲洤寮跺▓顐︽煟鎼淬値娼愰柟鎼侇棑缁牊绗熼埀顒勫灳閿曞倸閿ゆ俊銈勭濞堟繈姊婚崒姘卞缂佸鍨块敐鐐茬暆閸曨兘鎷洪柣鐘叉穿鐏忔瑧绮婚幓鎺嗘斀闁绘劘顕滈煬顒傗偓娈垮枛椤兘寮幘缁樺亹闁肩⒈鍓ㄧ槐鍙夌節绾版ɑ顫婇柛銊ゅ嵆楠炴牠顢曢敐鍡楀伎闂佸搫娲㈤崹娲煕閹达附鍋ｉ柛銉簻閻ㄨ櫣绱掗悪鍛偧缂佽鲸甯￠幊婊勬媴閸愵煈妫熸俊鐐€ら崑鍕崲閹邦喖寮叉俊鐐€曠换鎰板箠鎼粹檧鏋旈柟鎵閳锋垿鏌涢幇顒€绾ч悹鎰剁節閺屾稓鈧綆鍋呯亸鐢告煃瑜滈崜姘卞枈瀹ュ鍎庢い鏍ㄥ嚬濞兼牗绻涘顔荤盎鐎瑰憡绻傞埞鎴︽偐閹绘帗娈梻鍌氼槸缁夊墎妲愰幘瀛樺闁告挻褰冮崜閬嶆⒑鐟欏嫮鎽冪€规洜鏁搁崚鎺楀煛閸涱喖浜滈梺缁樻尭妤犵鐣甸崱娑欌拺闂傚牊绋撶粻姘舵煃瑜滈崜娆戝椤撶儐鐎舵い鏂跨毞閺€浠嬫煟濮楀棗鏋涢柣蹇氶哺閵囧嫰顢曢姀鈺傂ㄩ梺鐟扮畭閸ㄨ棄鐣烽幒鎴叆闁告侗鍨煎Σ绋库攽閻樺灚鏆╁┑顔芥綑鐓ら柕鍫濐槸閸戠姴銆掑锝呬壕闂佸搫鐬奸崰鏍箖瑜斿畷濂告偄閸濆嫬娈ラ梺璇叉捣閹虫捇骞夐敍鍕床闁告劦鍠栨闂佸憡娲﹂崹鎵尵瀹ュ鐓曢柕澶樺枤閸樻稒淇婇銏狀伃婵﹥妞藉畷銊︾節閸愩劍娈梻浣芥〃濞村洭顢氳閿濈偠绠涢幘浣规そ椤㈡棃宕熼鍡欏€為梻鍌欑閹测€趁洪敃鍌氬偍闁归棿绀侀崙鐘碘偓鍏夊亾闁逞屽墰濡叉劙骞樼€涙ê顎撻梺鎯х箳閹虫挾绮敍鍕＝濞达絿鐡旈崵娆撴煟濡も偓濡繈銆佸鑸垫櫜闁糕剝鐟ч惁鍫濃攽椤旀枻渚涢柛妯挎閳诲秴顭ㄩ崟顓犵槇闂侀潧楠忕徊鍓ф兜閻愵兙浜滄い鎾楀啫顫╁銈庡幖濞诧妇鎹㈠┑瀣倞闁靛鍨虹€氬ジ姊虹拠鏌ヮ€楁繝鈧潏銊﹀弿闁汇垻顭堣繚闂佸憡鍔﹂崰妤呮偂閻樼粯鍊甸柛锔诲幖瀛濋梺缁樻尰閸旀妲愰幒妤€纾兼繛鎴烆焽閻熴劌顪冮妶搴′簼缂佽鐗撻獮濠傤煥閸涱厽鐎冲┑鈽嗗灥椤曆囶敂瑜版帗鈷掗柛灞捐壘閳ь剟顥撳▎銏ゆ晸閻樿尙锛涢梺绯曞墲缁嬫垹澹曠紒妯肩闁瑰瓨鐟ラ悘顏堟煕閵堝棗濮堥柕鍥у瀵粙濡歌婵洤鈹戦悙鍙夊櫧濠殿喚鏁绘俊鐢稿礋椤栨艾鍞ㄥ銈嗗姦濠⑩偓婵炲矈浜铏圭磼濡闉嶅┑鐐跺皺閸犳牕顕ｆ繝姘亜闁绘挸娴烽ˇ顓㈡偡濠婂嫮鐭婇摶鐐哄箹缁顫婇柣鏂挎閹嘲鈻庤箛鎿冣偓鏇㈡煙鏉堝墽鐣卞鍛存⒑閸涘﹥澶勯柛銊ャ偢瀵偊宕堕浣哄幗闂佸綊鍋婇崢鐣岀礊閹达附鐓涢悗锝庡墮閳诲牓鏌熼绛嬫當闁崇粯鎹囧畷褰掝敊閻ｅ奔绨界紓鍌氬€风欢锟犲窗濡ゅ懏鍋￠柨鏃傛櫕閳瑰秴鈹戦悩鎻掍簽婵炲吋澹嗛埀顒€鍘滈崑鎾斥攽閻樻彃鏁い鎺嶆缁诲棝鏌ｉ幇鍏哥盎闁逞屽墯閻楁洟锝炶箛娑欏仭闁瑰啿锕ュ浠嬪箖閵忋倖鍋傞幖杈剧悼閺嗩偅绻濆閿嬫緲閳ь剚娲熼獮濠呯疀濞戞锛涢梺璺ㄥ枔婵敻鎮″☉姗嗙唵閻犺桨璀﹂崕娑㈡煕鎼存稑鍔滃ǎ鍥э躬椤㈡洟濮€閵忋垹濮辨繝娈垮枛閿曘儱顪冮挊澶屾殾妞ゆ劧绠戝敮闂侀潧顦伴崝褏寰婇崜褎宕叉繛鎴欏灪閸ゆ垶銇勯幒鍡椾壕闂佸搫顑嗛惄顖炲蓟閿濆應妲堥柛妤冨仦閻忓秹鎮楅崹顐ｇ凡閻庢凹鍣ｉ崺鈧い鎺戯功缁佺兘鏌涢弬鎸庢拱缂佸倸绉撮埞鎴犫偓锝庡亐閹锋椽姊洪崨濠勨槈闁挎洏鍊栭幈銊╁焵椤掑嫭鈷戦柛婵嗗閸ｈ櫣绱掔拠鑼闁伙絿鍏樻慨鈧柕鍫濇噹缁愭稒绻濋悽闈浶㈤悗姘煎櫍椤㈡瑩寮撮姀锛勫幐婵犮垼娉涢敃锔芥櫠閺囩儐鐔嗙憸宀€鍒掑▎鎾跺祦闁告劦鍠栫粈鍌滅磼濡ゅ嫭銆冪紒銊嚙椤啴濡堕崱妯烘殫闂佺顑囬崰鎰板疾閸洘鏅滈梺娆惧灠娴滅偓绻涢崼婵堜虎闁哄鍠庨埞鎴︽倷鐠囇嗗惈閻庢鍣崑濠囩嵁閸ヮ剦鏁囬柣鎰暩閻涱噣姊虹拠鎻掑毐缂傚秴妫濆畷婊冣枎閹捐泛绁﹂梺瑙勫婢ф鍩涢幋锔藉仯闁搞儺浜滈惃铏圭磼閻樺啿鈻曢柡灞剧〒閳ь剨缍嗛崜娆撳几濞戞埃鍋撶憴鍕闁搞劌娼￠悰顔碱潨閳ь剙鐣峰鍕闁惧繒鎳撴慨鍛婄節閻㈤潧袨闁搞劎鍘ч埢鏂库槈閵忊€冲壎闂佸吋绁撮弲娑⑺夊顑芥斀闁稿本纰嶉崯鐐烘煟閹捐泛鏋戝ǎ鍥э躬椤㈡稑鈹戦崶鏈靛摋闂備焦瀵х粙鎴犵矓瑜版帒钃熺€广儱顦介弫宥嗙箾閹寸偟鎳呮い锔诲幘缁辨挻鎷呮禒瀣懙闁汇埄鍨抽崑鐔肺ｉ幇鏉跨闁瑰啿纾崰鏍箠閺嶎厼鐓涢柛鎰ㄦ櫆缁朵即姊绘担绛嬪殭婵﹫绠撻敐鐐村緞婵炴帒鎼～婊堝焵椤掑嫬鏋侀柛鎰靛枛椤懘鏌曢崼婵囧櫤婵″樊鍓熷铏规崉閵娿儲鐏佹繝娈垮枛椤曨厾鍒掗崼銉ョ妞ゆ梻鏅崢顏呯節閻㈤潧鈧垶宕橀埡浣稿闂備胶顢婇幓顏堟⒔閸曨垰鐓曢柟鐑橆殕閻撴洟鎮橀悙鏉戠濠㈣锕㈤弻宥堫檨闁告挾鍠栬棢闁规崘娉涢崹婵嬫煕椤愩倕鏋旈柣鐔风秺閺屽秷顧侀柛鎾跺枛閹即顢欓崲澶嬫閸┾偓妞ゆ帒瀚ч埀顒婄畵婵℃悂鍩℃笟鈧崬璺衡攽閻樼粯娑ч柣妤€绻愰悾鐑藉醇閺囩啿鎷绘繛杈剧到閹诧紕鎷归垾鎰佺唵鐟滃酣銆冮崨绮光偓锕傚垂椤斻儳鍠栭幊鏍煛閳ь剛绮径鎰拺闁告繂瀚埢澶愭煕濡湱鐭欓柟顕嗙節瀵挳濮€閳ユ枼鍋撻崼鏇熺厽闁归偊鍘界紞鎴︽煕閺傝鈧繈寮诲☉銏犖ч幖绮光偓鎰佹浇缂傚倷鑳剁划顖炴儎椤栨氨鏆︽俊銈呮噺閸ゅ啴鏌嶆潪鎷岊唹闁瑰嚖绱曠槐鎾诲磼濞嗘劗銈版俊鐐茬摠閹倿鐛幇顓犵瘈婵﹩鍓涢鍡涙⒑閸涘﹦鈽夐柣掳鍔戝畷鐢稿礃椤旂晫鍘撻梺瀹犳〃缁€渚€寮冲▎鎾寸厽闊洢鍎抽悾鐢告煛鐏炲墽娲存鐐村浮楠炲顢涘┑鍡樺創濠德板€楁慨鐑藉磻閻愮儤鏅濋柕蹇嬪€戦埀顑跨閳诲酣骞橀弶鎴滄偅闂佽绻掗崑鐘参涢崟顓犱笉闁绘劖绁撮弨浠嬫煟濡櫣浠涢柡鍡忔櫅閳规垿鎮欓埡浣峰濠电姷鏁搁崑姗€宕犻悩璇茬闁绘劦鍓涢埥澶愭懚閺嶎厽鐓曟繝濞惧亾闁绘帪绠撳鎻掝煥閸啿鎷洪柣搴℃贡婵敻濡撮崘顔界厵妞ゆ垶鍎抽崝銉╂煏閸ャ劌濮嶆鐐村浮楠炴﹢宕楅崨顔炬綎缂傚倸鍊搁崐鐑芥倿閿斿墽鐭欓柟鐐湽閳ь兛鐒︾换婵嬪炊瑜忛崝锕€顪冮妶鍡楃瑐缂佲偓娓氣偓椤㈡艾顭ㄩ崼鐔哄幍婵炴挻鑹鹃悘婵囦繆閻ｅ瞼纾肩紓浣诡焽缁犵偟鈧娲忛崝鎴︺€佸璺哄窛妞ゆ巻鍋撻柟钘夘儔濮婂宕掑▎鎴М缂傚倸绉撮敃顏囨＂闂佽鍎抽顓犵不妤ｅ啯鐓冪憸婊堝礈閻旂厧钃熼柣鏃堫棑閺嗭箓鏌涢妷鎴斿亾闁哄鎳庨—鍐Χ閸愩劎浠惧銈冨妼閿曘倝鎮鹃悜钘夌婵°倐鍋撻崶鎾⒑閸涘﹣绶遍柛鐘愁殔琚欏鑸靛姈閳锋帡鏌涚仦鍓ф噭缂佷胶澧楅妵鍕即閸℃顏存繛鍫滅矙閺岀喖姊荤€靛壊妲梺绋胯閸斿秶鎹㈠┑鍥╃瘈闁稿本绮岄。铏圭磼閻愵剙鍔ゆい顓犲厴瀵鎮㈤悡搴ｇ暰閻熸粌绉归妴鍌氱暦閸モ晜锛忛梺璇″瀻娴ｉ晲鍒掗梻浣筋嚃閸犳銆冩繝鍥ф瀬闁归偊鍘介崕鐔兼煃閵夈儳锛嶆い鏃€鍨圭槐鎾存媴妤︽寧顎楅梺鍛娒妶鎼佸箖閵夛妇闄勭紒瀣劵閹芥洟姊虹捄銊ユ灁濠殿喗鎸抽悰顕€濮€鎺虫禍婊堟煙閹规劖纭鹃柛鎾归哺缁绘稑顔忛鐓庣睄濠殿喖锕ら幖顐ｆ櫏闂佹悶鍎滈崘銊愩倕鈹戦悙鑼憼缂侇喚濮电粋宥夘敂閸惊銉ッ归敐鍛棌婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺瑙勫劤绾绢厽顨ラ崶顒佲拺闁荤喖鍋婇崵鐔兼煕鎼淬垹濮堢紒鍌涘浮閺佸倿鎮惧畝鈧惁鍫ユ⒑濮瑰洤鐏叉繛浣冲嫮顩锋繝濠傜墛閻撶喖骞掗幎钘夌閹兼番鍔岀粈鍡涙煙閻戞ê鐏╅柡鍡楁閺屽秷顧侀柛鎾寸☉鍗遍柟鎵閸婄兘鎮楅棃娑欐喐闁伙箑鐗撳娲箹閻愭彃濡ч梺绯曞墲钃遍柛鐔告そ濮婂宕掑▎鎺戝帯缂備緡鍣崹璺侯嚕婵犳艾惟闁宠桨娴囪闂佽鍑界紞鍡涘窗閺嶎偄顥氶柛锔诲幘绾捐棄霉閿濆拋娼犻柤娴嬫櫆瀹曟煡鏌涢埄鍏︽粍绂嶅鍫熺厸鐎广儱鍟俊璺ㄧ磼閻樺磭澧柕鍥у缁犳盯寮撮悙鎰╁灲濡焦寰勯幇顓犲幗濠殿喗銇涢崑鎾寸箾娴ｅ啿鎳忛弳婊堟煠閸濄儱浠ù婊勭矋閵囧嫯绠涢幘鎰佷患闂佸搫妫寸徊浠嬪煘閹达箑鐏崇€规洖娲ら悡鐔兼倵鐟欏嫭绀€鐎规洦鍓濋悘鎺楁⒑缂佹ɑ灏Δ鐘殿焾鏁堥柟缁樺坊閺€浠嬫煟濡椿鍟忛柡鍡╁灡娣囧﹪骞撻幒鎾虫畻閻庤娲橀崹鍨暦閵娾晩鏁嶆繛鎴灻花銉╂⒒娴ｇ顥忛柛瀣噽閹广垹顓兼径濠傛優闂佸搫娲ㄩ崑鎰板绩娴犲鐓熸俊顖濇閿涘秵銇勯敐鍡欏弨闁哄矉绻濆畷銊╊敊閹冪哗闂備礁鎼張顒勬儎椤栫偛鏄ラ柛鏇ㄥ灠缁€鍌炴煟濞嗗苯浜炬繛瀛樼矤娴滄粓鎮惧畡鎵虫斀閻庯綆浜滅粣娑橆渻閵堝棙瀵欓柛鏇ㄥ亞濡诧綁姊婚崒娆戠獢婵炰匠鍥ㄥ亱闁糕剝銇傚☉妯锋婵炲棙鍔栭悵宄邦渻閵堝棗绗掗柛濠呭吹婢规洟宕楃粭杞扮盎闂佸搫鍟崐鍝ユ暜閼哥偣浜滈柟鍝勵儏閻忔煡鏌″畝瀣埌閾绘牠鏌嶈閸撶喖寮绘繝鍥ㄦ櫜闁告粈鐒︾紞搴㈢節閻㈤潧校闁肩懓澧芥竟鏇㈠礂閼测晝顔曢梺绯曞墲閿氶柣鎺斿亾娣囧﹤顔忛鍏肩彎濠殿喖锕ㄥ▍锝呪槈閻㈢宸濇い鎾愁槹閹稿墽妲愰幒妤婃晩闁兼祴鏁╄椤ㄣ儵鎮欓懠顒€鈪垫繝纰樺墲閹倿宕洪敓鐘茬＜婵﹩鍋嗙槐锕傛⒒閸屾瑧顦﹂柟璇х磿缁瑩骞嬮敂鑺ユ珖闂侀潧鐗嗗Λ娑€呴弻銉︾厱婵°倕鍟禍褰掓煛閳ь剚绂掔€ｎ偆鍘藉┑鈽嗗灡椤戞瑩宕电€ｎ兘鍋撶憴鍕仩闁稿海鏁诲濠氭晲閸涘倹妫冮崺鈧い鎺戝閺呮繃銇勮箛鎾愁伀闁哄棴绠撻弻锟犲炊閳轰焦鐎荤紓浣稿閸嬨倝骞冨Δ鍛櫜闁告劑鍔岄‖鍡欑磽娴ｉ潧濡兼い顓炲槻铻為柛娑欐儗閺佸啴鏌曡箛濞惧亾閹颁焦袩闂傚倷娴囬～澶愭偤閺囩偟鏆﹂柣銏ゆ涧閸ㄦ繂鈹戦悩鍙夋悙闁绘挻鐩弻娑氫沪閸撗勫櫘缂備胶濮甸懝楣冣€旈崘顔嘉ч柛鈩冪懃椤囨⒑閻撳海绉虹紒鐘崇墵閵嗕線寮崼顐ｆ櫍闂佺粯姊婚…鍫濐嚕閹稿海绡€闁汇垽娼у瓭闂佺懓鍟跨换姗€銆侀弮鍫熷亹缂備焦顭囬崢鍨繆閻愬樊鍎忓Δ鐘虫倐閸┿垽宕奸妷锔惧幈闂侀潧艌閺呮繈鎮惧ú顏呯厵闁绘挸娴风粔鐑樸亜閵忊剝绀嬪┑鈥崇埣瀹曠喖顢涘顐ょ幓缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻娑樷攽閸曨偄濮㈤梺娲诲幗閹瑰洭寮婚悢铏圭＜闁靛繒濮甸悘宥夋⒑閸濆嫭鍣虹紒璇插暣婵＄敻宕熼鍓ф澑闂佽宕樺▔娑⒙烽埀顒勬⒒娴ｄ警鐒炬い鎴濇閹筋偊姊洪棃娑欐悙閻庢碍婢橀锝夘敋閳ь剙鐣烽幒鎴旀婵炲棙鍨靛☉褔姊婚崒娆愮グ鐎规洜鏁诲畷鐗堟償閿濆洨顦繝鐢靛Т濞层倝鎷戦悢琛″亾楠炲灝鍔氶柣妤佺矊椤﹪濡搁埡鍌楁嫼闂佸憡绋戦敃銉т焊閻㈠憡鐓曢柣妯虹－婢у灚顨ラ悙鎻掓殲閻庨潧銈搁獮鏍敇閻斿憡鐝ㄩ梻鍌欑窔閳ь剛鍋涢懟顖涙櫠閹绢喗鐓熸繛鎴濆船濞呭秵顨ラ悙鏉戞诞妤犵偛锕幖褰掝敃閿濆孩顥堥梻浣虹《閺備線宕戦幘鎰佹富闁靛牆妫楃粭鎺楁煕婵犲嫮甯涚紒瀣槸椤撳吋寰勭€ｎ剙寮虫繝鐢靛█濞佳兾涘▎鎾嶅鎮╅悽鐢碉紲闂佹娊鏁崑鎾绘煕鐎ｎ偅宕屾慨濠勭帛閹峰懐绮欏▎鐐棏闂備胶绮幐鎼佹偋閹惧磭鏆﹂柟杈剧畱缁€瀣亜閹哄秶顦︾€殿喗瀵х换婵嬪閿濆懐鍘梺鍛婃⒐閻楃娀骞冮敓鐘茬妞ゅ繐鎳庨弸鎴濃攽閻樿宸ラ柣妤€妫涚划鍫ュ醇閻旇櫣顔曢梺鐟扮摠閻熴儵鎮橀埡鍐＜闁逞屽墴瀹曟帒鈽夊Δ鍐暰婵＄偑鍊栭悧妤呮偡閵娾晩鏁嗛柣鏂挎憸缁犻箖鏌涜箛姘汗濠⒀屽墰缁辨帞绱掑Ο灏栨濡炪倖鏌ㄧ换姗€銆佸▎鎾村殥闁靛牆娲﹂弲銊╂⒑鐠囧弶鎹ｉ柟铏崌楠炲鏁嶉崟顒€搴婇梺绋跨灱閸嬫盯鎮″鈧弻鐔告綇妤ｅ啯顎嶉梺绋款儐閸旀瑩寮婚悢铏圭＜婵☆垵妗ㄩ崚濠囨⒑閸涘﹥鐓ユい锕傛涧椤繘鎮滃Ο渚殼濠电偛妫欓崹鐢稿春鐏炲墽绡€闁冲皝鍋撻柛鎰ㄦ櫆瀹曞啿鈹戦垾鍐茬骇闁告梹鐟╅悰顔嘉熺亸鏍т壕婵炴垶顏鍫晛闁瑰墽绮埛鎴︽煙椤栧棗鎳愰濠囨⒑绾懏鐝柟绋垮⒔閸掓帡顢橀姀鈩冩闂佺粯蓱閺嬪ジ骞忓ú顏呪拺闁革富鍙庨悞鐐箾鐎电鍘撮柕鍡楀€垮濠氬Ψ閿旀儳甯?/p>';
      return;
    }
    elements.detailPanelContent.innerHTML = [
      detailSection("Terrain", [
        ["Name", record.name],
        ["Terrain Type", terrainTypeLabel(record.terrainType)],
        ["Coord", record.coordSystem || "-"],
        ["Range", formatTerrainRange(record)],
        ["Source", record.source || "-"],
        ["Resolution", record.resolution || "-"],
      ]),
      detailSection("Terrain Ref", [
        ["Heightmap", record.heightmapRef || "-"],
        ["Mesh", record.meshRef || "-"],
        ["Texture", record.textureRef || "-"],
      ]),
      detailSection("Notes", [["Content", record.notes || "No notes"]]),
    ].join("");
    return;
  }
  __originalRenderDetailPanel();
};

elements.terrainChangeForm = document.querySelector("#terrain-change-form");
elements.terrainChangeWorkArea = document.querySelector("#terrain-change-work-area");
elements.terrainChangeType = document.querySelector("#terrain-change-type");
elements.terrainChangeQuantityId = document.querySelector("#terrain-change-quantity-id");
elements.terrainChangeSpatialId = document.querySelector("#terrain-change-spatial-id");
elements.terrainChangeTerrainId = document.querySelector("#terrain-change-terrain-id");
elements.terrainChangeDay = document.querySelector("#terrain-change-day");
elements.terrainChangeResultRef = document.querySelector("#terrain-change-result-ref");
elements.terrainChangeNotes = document.querySelector("#terrain-change-notes");
elements.terrainChangeLoadSelected = document.querySelector("#terrain-change-load-selected");
elements.terrainChangeList = document.querySelector("#terrain-change-list");
elements.terrainChangeWorkAreaFilter = document.querySelector("#terrain-change-work-area-filter");
elements.terrainChangeTypeFilter = document.querySelector("#terrain-change-type-filter");
elements.terrainChangeSearch = document.querySelector("#terrain-change-search");

filters.terrainChangeWorkArea = "all";
filters.terrainChangeType = "all";
filters.terrainChangeSearch = "";

function getVisibleTerrainChangeSets() {
  return [...(state.terrainChangeSets || [])]
    .filter((item) => filters.terrainChangeWorkArea === "all" || item.workAreaId === filters.terrainChangeWorkArea)
    .filter((item) => filters.terrainChangeType === "all" || item.changeType === filters.terrainChangeType)
    .filter((item) => matchesSearch(`${item.id} ${item.resultRef} ${item.notes} ${item.quantityId} ${item.spatialRawObjectId}`, filters.terrainChangeSearch))
    .sort((a, b) => {
      if ((a.recordDay ?? 0) === (b.recordDay ?? 0)) {
        return a.id.localeCompare(b.id);
      }
      return (b.recordDay ?? 0) - (a.recordDay ?? 0);
    });
}

function terrainChangeTypeLabel(type) {
  if (type === "cut") {
    return "Cut";
  }
  if (type === "fill") {
    return "Fill";
  }
  if (type === "leveling") {
    return "Leveling";
  }
  if (type === "paving") {
    return "Paving";
  }
  if (type === "structure") {
    return "Structure";
  }
  return type || "-";
}

function resetTerrainChangeForm() {
  elements.terrainChangeForm.reset();
  elements.terrainChangeType.value = "fill";
  elements.terrainChangeDay.value = String(state.currentDay);
}

function renderTerrainChangeWorkAreaOptions() {
  const current = elements.terrainChangeWorkArea.value;
  elements.terrainChangeWorkArea.innerHTML = state.workAreas.map((area) => `<option value="${area.id}">${area.name}</option>`).join("");
  if (state.workAreas.some((area) => area.id === current)) {
    elements.terrainChangeWorkArea.value = current;
  } else if (state.workAreas.length) {
    elements.terrainChangeWorkArea.value = state.workAreas[0].id;
  }
  if (!elements.terrainChangeDay.value) {
    elements.terrainChangeDay.value = String(state.currentDay);
  }
}

function renderTerrainChangeSets() {
  const items = getVisibleTerrainChangeSets();
  if (!items.length) {
    elements.terrainChangeList.innerHTML = '<p class="empty-state">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈嗙節閳ь剟鏌嗗鍛姦濡炪倖甯掗崐褰掑吹閳ь剟鏌ｆ惔銏犲毈闁告瑥鍟悾宄扮暦閸パ屾闁诲函绲婚崝瀣уΔ鍛拺闁革富鍘奸崝瀣煕閵娿儳绉虹€规洘鍔欓幃娆撴倻濡桨鐢绘繝鐢靛Т閿曘倝宕幍顔句笉闁煎鍊愰崑鎾斥枔閸喗鐏嶆繝鐢靛仜閿曨亜顕ｉ锕€绀冩い鏃囧亹閿涙粌鈹戦悙鏉戠仸闁煎綊绠栭悰顔嘉旈崨顔规嫽婵炴挻鍩冮崑鎾寸箾娴ｅ啿鎳忓畷鏌ユ煕椤愮姴鍔氶柡鍕╁劦閺屾盯寮撮妸銉т画闂佺锕ゅ锟犲蓟濞戙垹绠绘俊銈傚亾闁硅櫕鍔欓弫宥咁煥閸啿鎷洪悷婊呭鐢帗绂嶆导瀛樼厱婵炲棗绻橀妤呮煃缂佹ɑ灏い顓滃姂瀹曞ジ鎮㈤崫鍕闂佽楠搁崢婊堝磻閹剧粯鐓冪憸婊堝礈閻旈鏆﹀ù鍏兼綑閸愨偓濡炪倖鎸鹃崑鐘诲箺閺囥垺鈷戦柟鑲╁仜閸旀挳鏌涢幘鏉戝摵鐎殿喗褰冮埞鎴犫偓锝庡亞閸樻捇鎮峰鍕煉鐎规洘绮撻幃銏＄附婢跺﹥顓跨紓鍌欑椤戝懐鑺遍崡鐐嶏綁宕奸妷锔惧帾闂婎偄娲㈤崕宕囧閸ф鐓曟慨妞诲亾濞存粏娉涢～蹇撁洪鍜佹濠电偞鍨兼禍顒勫矗濮橆厾绡€缁剧増菤閸嬫捇鎼归銏㈢崺缂傚倷绶￠崰鏍€﹂悜钘夌畺婵炲棙鎸哥粻瑙勩亜閹捐泛娅忛柛鐔风Ч濮婄粯鎷呴搹鐟扮闂佸憡姊瑰ú鐔笺€佸棰濇晣闁绘柨鎲￠悵宄邦渻閵堝懐绠伴柣妤€锕畷鐢稿即閵忥紕鍘甸梻渚囧弿缁犳垿鐛幋婢濈懓顭ㄩ崟顓犵厜闂佸搫鐬奸崰鏍х暦椤愶箑绀嬫い鎺戭槹椤ワ絽鈹戦悙鑼憼缂侇喗鎸剧划濠氬冀瑜滃鏍煣韫囨凹娼愰悗姘哺閺屾稑鈻庤箛锝喰ㄥ銈傛櫇婢ф鎹㈠☉姘ｅ亾濞戞瑯鐒介柣顓烆儑缁辨帞鎷犻幓鎺濅純濡ょ姷鍋為崹鎸庢叏閳ь剟鏌ｅ鍡椾簼妞ゎ偄绉瑰娲濞戞氨顔婃繝娈垮枛椤曨厾鍒掗敐鍛婵妫欑€靛矂姊洪棃娑氬婵☆偅绋掗弲鍫曨敆娴ｅ吀绨婚梺鍝勬川閸犳劗浜搁敃鍌涚厸濞达絿鎳撴慨宥団偓瑙勬磸閸庨潧鐣峰鈧濠氬Ψ閵夈儱寮烽梺璇叉唉椤煤濮椻偓瀹曟洘绺介崲搴涘姂瀹曟帡鎮欓幖顓燁棅婵＄偑鍊栫敮鎺椝囬娑欐珷妞ゆ洍鍋撻柡灞界Ф閹叉挳宕熼銈勭礉闂備焦鎮堕崝宥夊磿閹惰姤鍋╅柣鎴ｆ閻愬﹦鎲歌箛娑樺偍濞寸姴顑嗛悡鐔煎箹濞ｎ剙鈧倕顭囬幇顓犵闁圭粯甯炵粻鑽も偓瑙勬礃缁诲牓鐛€ｎ喗鏅滈悶娑掆偓鍏呭婵炶揪绲跨涵鍫曞几鎼淬劍鐓欓柟顖嗗拑绱炲銇礁鎳愮壕濂告煟閹伴潧澧紒鎯板皺閹叉悂寮跺▎鐐枅閻庤娲﹂崑鍕亙闂佸憡鍔︽禍鐐烘晬濠靛鈷戠紒瀣濠€浼存煠瑜版帞鐣洪柛鈹惧亾濡炪倖甯婇悞锕傚磹閹邦喒鍋撶憴鍕闁告梹鐟╅獮鍐煥閸喎娈熼梺闈涱槶閸庢煡鎮鹃柆宥嗏拻濞达綀妫勬禍瑙勩亜椤撶偟澧﹂柟顔矫～婵堟崉閾忓湱鍘梻濠庡亜濞诧妇绮欓幒妤佸亗婵炲棙鎸婚悡娆愩亜閺嶃劎鐭婃い锝呭悑閵囧嫰濡烽妷顔叫ㄩ梺姹囧労娴滎亪銆佸Ο琛℃婵☆垳鎳撻ˉ姘舵⒒閸屾艾鈧悂宕愬畡鎳婂綊宕堕濠勭◤婵犮垼鍩栭崝鏇犲閸ф鐓熼柟鎯у暱椤斿倹绻涢幋娆忕仼缂佲偓鐎ｎ偁浜滈柡宥冨妿閳藉鏌ｅ┑鍥棃婵﹨娅ｇ槐鎺懳熼懡銈呭汲闂備胶顢婃慨銈囧垝鎼达絽鍨濈紓浣骨滈崑鍛存煕閹般劍娅囬柛妯兼暬閺岋絾鎯旈敐鍡樻瘎濡炪値鍘奸悧鎾诲春閳ь剚銇勯幒宥囶槮闁诲繈鍎查妵鍕敃閿濆洨鐤勫銈冨灪閻楃娀宕洪敍鍕ㄥ亾閿濆骸澧扮悮锕傛煟鎼淬値娼愭繛鍙夌墵婵″爼骞栨担鍝ョ暫闂侀潧绻堥崹濠氭儗濞嗘挻鐓曟い顓熷灥閺嬫瑧绱掓潏鈺佹瀻闁宠鍨块幃鈺呮嚑椤掍緡妫勯梻浣告惈椤︻垳鑺遍柆宥呯；闁规崘顕х粻娑㈡煛婢跺孩纭堕柨娑欑洴濮婃椽鎮烽弶搴撴寖缂備緡鍣崹鍫曞箖閿熺姵鍋勯梻鈧幇顔剧暰闂備線娼ч悧鍡涘磹閸涘﹦顩插Δ锝呭暞閳锋垿鏌熺粙鍨劉濠㈣泛瀚湁婵犲﹤瀚惌鎺撱亜閵忊€冲摵闁轰焦鍔栧鍕熺紒妯荤彇闂傚倷鐒︾€笛兠哄澶婄；闁规儳澧庣壕濂告煟濡寧鐝柣銊﹀灴閺岀喖骞撻幒鎾虫殘閻庡灚婢樼€氫即鐛崶顒夋晢闁稿本纰嶉幉銏＄節閻㈤潧浠滄い鏇ㄥ幗閹便劑骞橀鍛櫈闂佺硶鍓濈粙鎺楀磻閸岀偞鐓熼柡鍌氱仢閹垿鏌ｉ幘瀵告噰婵﹥妞介、姗€濡歌閺嗙姵绻濋埛鈧仦鑺ョ亾缂備浇椴哥敮锟犲箖椤忓嫧鏋庨煫鍥ㄦ煥椤︹晠姊虹紒妯诲鞍婵炶尙鍠栧濠氬Ω閵夈垺鏂€闂佺硶鍓濋悷銉┞烽埀顒佷繆閻愵亜鈧垿宕曢柆宓ュ洭鎮界粙鑳憰閻庡箍鍎卞ú锕傚窗閸℃稒鐓曢柡鍥ュ妼娴滅偛霉閻撳海鐒告慨濠呮閹风娀鍨鹃搹顐や憾闂備浇宕甸崯鍧楀疾閻樿尙鏆︽繛宸簻閻掓椽鏌涢幇銊︽珔妞ゅ孩鎹囬幃妤呮偡閺夋浼冮梺绋款儏閿曘倛鐏嬪┑鐘诧工閻楀﹪鍩涢幒妤佺厱閻忕偞宕樻竟姗€鏌嶈閸撴岸骞冮崒姘辨殾闁归偊鍙庡Σ褰掑箹鏉堝墽鎮奸柣鎺戝悑缁绘盯骞橀弶鎴犲姲闂佺顑嗛幐濠氥€冮妷鈺傚€烽悗鐢殿焾閳峰苯顪冮妶鍐ㄧ仾婵炶尙鍠栧顐﹀磼閻愭潙鐧勬繝銏ｆ硾閿曘倝藟濡や胶绡€闁汇垽娼цⅷ闂佹悶鍔庨崢褔鍩㈤弬搴撴闁靛繆鈧櫕顓烘俊鐐€栭悧妤冨垝瀹ュ鏁冨ù鐘差儐閻撳繘鏌涢锝囩婵℃彃缍婇弻锝夊箻鐎涙顦ラ梺瀹狀潐閸ㄥ潡骞冮埡鍛闁圭儤绻€閹綁姊绘担鍛婃儓妞ゆ垵妫濆濠氬Ω閳哄倻鐣冲┑鐘垫暩婵澧濋梺绋款儐閹稿墽妲愰幒妤婃晩闁伙絽鏈崳褍顪冮妶搴′簻缂佺粯甯炲Σ鎰板箳閹冲磭鍠撻幏鐘差啅椤旂懓浜鹃柟鎯ь嚟缁犻箖鏌熼悙顒佺稇闁搞値鍓熼弻娑㈠Ω閿曗偓閳绘洜鈧娲樼换鍫濈暦椤愶箑唯鐟滃繘鏁嶅┑鍥╃閺夊牆澧界粔顒佺箾閸滃啰鎮奸柡渚囧枛閳藉濮€閿涘嫬骞堥梻浣告惈閸熺娀宕戦幘缁樼厽闁绘梹娼欓崝锕傛煙椤曗偓缁犳牠骞冨鍫熷癄濠㈠厜鏂傞崝搴ㄥ箟閸涘﹤绶為柟閭﹀墰閿涙盯姊洪悷鏉库挃缂侇噮鍨跺鏌ュ蓟閵夈儳顔愰柣搴㈢⊕閳笺倝顢旈崨顖ｆ锤闂佺粯鍔﹂崗娆愮濠婂牊鐓涚€广儱鍟俊鍧楁煃閽樺妲圭紒缁樼洴楠炴牠顢橀悙瀵镐壕闂備線鈧偛鑻晶鍙夈亜椤愩埄妲搁悡銈嗙節婵犲倻澧曠紒鎰殜閺屸€愁吋鎼粹€崇闂侀€炲苯鍘哥紒鑸佃壘椤曪絾绂掔€ｅ灚鏅濋梺鎸庣箓閹虫劙鏁嶈箛娑欌拻濞撴埃鍋撴繛浣冲棗娅ｉ梻浣告啞娓氭宕板Δ鍛剨闁绘劗鍎ら埛鎺楁煕鐏炴崘澹橀柍褜鍓氶幃鍌氱暦閹扮増鍊婚柤鎭掑劚濞堟垿姊洪崨濠冨矮缂佲偓娓氣偓瀹曠懓鈹戦崶銉ょ盎闂佸搫绋侀崑鍕濠婂懐纾奸柍褜鍓氬鍕箛椤撶姴骞愰柣搴＄畭閸庤鲸顨ョ粙娆惧殨濡わ絽鍟悡娑樏归敐澶嬩氦闂婎剦鍓熼弻锛勪沪缁洖浜鹃柟棰佺閹垿鏌熼懖鈺勊夐柍褜鍓欑壕顓㈩敊閹邦喚纾介柛灞捐壘閳ь剟顥撻幏瀣蓟閵夈儳鏌ч梺缁橆焾椤曆囨嫅閻斿吋鐓ユ繝闈涙閸熸帡鏌￠崘銊у闁绘帒鐏氶妵鍕箳閹存繍浠鹃梺绋款儏椤戝鎮￠锕€鐐婇柕濠忓椤︻厽绻涢幋鐐村碍缂佸顥愰悘鍐⒑閹稿海绠撻柟鍐查叄瀵娊鎮欓悜妯煎幗闂佽鍎抽悺銊х矆閸愵亞纾肩紓浣诡焽濞插瓨顨ラ悙宸剰闁宠鍨垮畷鍗烆潩椤掑倸骞嬮梻鍌氬€风粈渚€骞栭锔绘晞闁搞儺鍓欑粣妤呮煙閹规劕鐓愭い顐ｆ礋閺岀喖鎮滃鍡樼暥闂佺粯甯掗悘姘跺Φ閸曨垰绠抽柟瀛樼箥娴犲ジ姊绘担绋胯埞婵炲樊鍙冨濠氬即閻旈绐炲┑鐐村灦閿曗晛煤椤撱垺鈷戦柛娑橆煭閼版寧绻涙担鍐叉娴滄瑩姊绘担铏瑰笡闁挎洏鍨归…鍥槼缂佸倹甯掗…銊╁醇閻斿搫骞楅梻濠庡亜濞诧箑顫忛懡銈囦笉闁绘劗鍎ら悡娆愩亜閺冣偓閺嬪鎳撻崸妤佺厱闁冲搫顑囩弧鈧悗瑙勬磸閸旀垿銆佸▎鎾崇畾鐟滃秶绮鑸碘拻闁稿本鐟︾粊鏉库攽椤斿搫鈧繈寮€ｎ亶娓婚柕鍫濈箳閻ｈ櫕淇婇銏狀伂闁诲繑甯″娲焻閻愯尪瀚板褜鍨崇槐鎺旂磼濡偐鐣甸梺宕囩帛閹瑰洤鐣疯ぐ鎺濇晩闁伙絽濂旂花顕€姊婚崒娆掑厡妞ゎ厼鐗撻、鏍幢濞戞顔夐梺鎼炲劀鐏炲墽绋侀梻浣瑰劤缁绘劕锕㈡潏鈺侇棜闁稿繘妫跨换鍡樸亜閺嶃劎鈯曠紒鈧崘顔界厱闁靛鍎查崑銉╂煏閸℃洜顦﹂柍璇查叄楠炴﹢宕橀幓鎺撴殢濠碉紕鍋戦崐鏍箰妤ｅ啫纾婚柣妯硅閺夋椽姊婚崒姘偓椋庣矆娓氣偓楠炲鏁嶉崟顓犵厯闂佺鎻梽鍕磻閵堝鐓忓┑鐐靛亾濞呭懘鏌ｉ幘瀛樼闁哄瞼鍠栭幃婊兾熼悜姗嗗敶闁荤喐绮庢晶妤冩暜濡ゅ懎鐤鹃柡灞诲劜閻撴洘绻涢幋婵嗚埞闁哄鐩弻锟犲幢濡ゅ啫鈪靛┑顔硷龚濞咃綁骞忛悩璇茬伋鐎规洖娲ｉ崫妤呮⒒娴ｈ櫣甯涙い銊ユ楠炴垿宕惰閸ゆ洟鎮归崶銊с偞婵℃彃鐗撻弻鏇＄疀婵炴儳浜鹃柛蹇撴噽閻╁酣姊婚崒娆戭槮闁硅绱曢幑銏ゅ磼濠ф儳浜炬慨妯峰亾闁搞儜鍐ㄦ闂備礁鎲＄粙鎴︽偤閵娾晛纾归柣銏犳啞閸嬧剝绻涢崱妤冪妞ゅ浚浜炵槐鎺楀焵椤掑嫬绀冩い鏃傛櫕閸橀亶姊洪棃娑辩劸闁稿孩鐓″畷鎴﹀Ψ閳哄倻鍘藉┑鐐村灥瀹曨剟寮稿☉銏℃嚉闁挎繂顦伴悡鐘崇箾閺夋埈鍎愭繛鍛喘閺屻劌鈽夊▎鎴犵厐闂佸疇顫夐崹鍧楀春閵夆晛骞㈡俊銈呭暕閸栨牠姊绘担鍛婂暈妞ゎ厼妫濆畷鍫曞煛娴ｆ亽鍋婇梻鍌欑婢瑰﹪宕戞笟鈧畷鏇㈠蓟閵夈儳鍘遍梺鍦劋閸ゆ俺銇愰幒鎾存珳闂佹悶鍎崝灞解枔鐏炵瓔娓婚柕鍫濇缁€鍐磼椤斿吋鎹ｆ俊鍙夊姍楠炴帡寮埀顒傗偓姘哺閺岀喓绱掑Ο鍝勬綉闂佺顑嗛幐鑽ゆ崲濠靛棭娼╂い鎺戝€告慨锔戒繆閻愵亜鈧牜鏁繝鍕焼濞撴埃鍋撶€规洜鏁婚、妤呭礋椤掑倸骞堥梻浣筋潐閸庢娊顢氶銏犵疇闁搞儺鍓氶悡娆愩亜閺囨浜剧紓浣哄У閻楃娀鐛崘顔藉仼鐎光偓閳ь剟鎯屽▎鎾寸厱妞ゎ厽鍨甸弸锕傛煃瑜滈崜娆撴倶濠靛鐓橀柟杈鹃檮閸婄兘鏌℃径瀣仼濞寸姵鎮傚娲嚒閵堝懏娈岄梺鎼炲劀閸愩劋鎲鹃梻鍌欑缂嶅﹤螞閸ф鍊块柨鏇炲€归崑鍌炴煟閺冨洤浜归柛娆愭崌閺屾盯濡烽敐鍛瀴缂備讲鍋撻柍褜鍓氱换娑氣偓鐢殿焾鏍＄紓渚囧枛閻倿鍨鹃敃鍌涘殑妞ゆ牭绲炬缂傚倸鍊风欢锟犲窗濡ゅ懏鍋￠柨鏃傛櫕閳瑰秴鈹戦悩鍙夋悙缂佺姷绮妵鍕籍閸パ傛睏濡炪倖鏌ㄩ敃銈夊煘閹寸偛绠犻梺绋匡攻閹瑰洭骞婂Δ鍛唶闁哄洨鍋涢崑宥夋⒑閻熸澘鈷旂紒顕呭灦瀹曟垿鍩勯崘顏嗙槇婵犵數濮撮崐鎼侇敂椤愶附鐓熸い鎾跺枎缁椦囨煃瑜滈崜婵嬶綖婢跺⊕鍝勎熼悡搴＄亰闂佺懓澧界换婵堟崲閸℃ɑ鍙忔繝闈涙閻掔偓淇婇幓鎺戔挃缂佽鲸鎸婚幏鍛村箵閹哄秴顥氭繝鐢靛Х閺佸憡鎱ㄩ弶鎳ㄦ椽鏁冮崒娑樹簵闂佸搫娲㈤崹娲偂閸愵喗鐓冮弶鐐村椤︼箓鏌￠崱娆忔灈闁哄苯绉归幐濠冨緞濡亶銊╂⒑濮瑰洤鍔村ù婊庝邯閻涱噣宕卞鍏碱€囬梻浣虹帛閹告悂濡堕幖浣歌摕闁挎稑瀚▽顏堟煕閹炬せ鍋撴俊鎻掔墦濮婅櫣鈧湱濮甸ˉ澶嬨亜閿曞倹娑ч柣锝囧厴閺佹捇鎮╅崘娴嬪亾閻戣姤鐓曢煫鍥ㄦ尰閸熺偤鏌涢埡鍌滄创婵﹤顭峰畷鎺戔枎閹烘垵甯紓鍌欑贰閸ｎ噣宕归幎钘夋瀬妞ゆ洍鍋撴鐐村笒铻栧ù锝堫潐閻濇牗淇婇悙顏勨偓鏇犳崲閹扮増鍋嬮柛鈩冪⊕鐎氬懘鏌ｉ弬鍨倯闁绘挾鍠栭弻锟犲磼濠靛洨銆婂┑鐐茬墦娴滃爼寮婚敍鍕ㄥ亾閿濆骸浜濇い銉ョ墦閺岋紕浠﹂崜褎鍒涢梺鐐藉劵缁犳捇鐛€ｎ亖鏀介柛銉㈡櫃閹查箖姊婚崒娆愮グ妞ゆ泦鍛床闁糕剝绋戠壕濠氭煙閸撗呭笡闁抽攱甯￠弻娑氫沪閸撗勫櫙闂佺绻愰張顒勫Φ閸曨垼鏁囬柣鎰版涧閳潧顪冮妶鍐ㄧ仾闁绘濮撮悾鐑藉础閻愨晜顫嶅┑鈽嗗灣閳峰牓宕ぐ鎺撯拻濞达綀顫夐崑鐘绘煕鎼淬垻鐭掔€规洏鍔戦、娆戠驳鐎ｎ亝娅楅梻鍌欐祰瀹曠敻宕伴幇顔煎灊閹兼番鍨哄▍鐘充繆閵堝懎鏆為柡鍡樼矒閺屽秹宕崟顒€娅ｉ梺鍝勵儎缁舵岸寮诲☉銏犵疀闂傚牊绋掗悘宥夋⒑缂佹ɑ灏柛搴ゅ皺閹广垹鈹戠€ｎ偒妫冨┑鐐村灦閻燁垰螞閿熺姵鈷戦柣鐔告緲閹垿鏌涢弮鈧悷鈺侇嚕鐠囨祴妲堥柕蹇曞瑜旈弻娑㈠焺閸愮偓鐣烽柣鐘叉川閸嬫盯鍩為幋锔绘晩缁绢厾鍏樼欢鏉戔攽閻愬弶瀚呯紓宥勭窔閻涱喛绠涘☉娆忎汗闁荤姴娲╃亸娆擃敊瀹€鍕拺闁革富鍘奸崝瀣磼鐠囨彃鈧绌辨繝鍥ㄥ€婚柤鎭掑劗閹风粯绻涙潏鍓у埌闁硅绻濆畷顖炴倷閻戞鍘遍梺闈浤涢崟顒佺槑缂傚倷娴囨禍顒勫磻閻愬灚宕叉繝闈涱儏绾惧吋绻濇繝鍌氼仾妞ゆ梹娲熷缁樻媴缁涘缍堥梺绋块閸氬骞堥妸鈺佄у璺猴功閺屟囨⒑閸︻厾甯涢悽顖楁櫊閹垽宕卞☉娆忎化闂佹儳绻掗幊鎾绘儍閹达附鐓涢柍褜鍓涚槐鎺懳熼崷顓犵暰闁诲海鎳撴竟濠囧窗閺嶃劍娅犻悗娑櫳戦崣蹇撯攽閻樻彃鏆為柕鍥ㄧ箞閺岋紕浠﹂懞銉ユ畻闂佽鍠楅悷鈺呭箠閻樺灚宕夊〒姘煎灟缁辨梹绻濋悽闈浶涢柟宄板暟娴狅箓鎮剧仦鍏碱敇闂傚倷绀侀幖顐﹀嫉椤掆偓鐓ら柣鏃堫棑閺嗭箓鏌熼鐐蹭喊婵¤尪顕ч—鍐Χ閸涱喚顩伴梺鍛娒肩划娆撳Υ閸愵喖唯闁冲搫鍊搁埀顒傚厴閺屸剝寰勭€ｎ亞浠搁柣鐘叉川閸嬫稖鐏冮梺缁橈耿濞佳勭濠婂嫨浜滈柟瀛樼箥濡偓闂侀潧妫旂粈渚€鍩ユ径濠庢建闁糕剝锚閸忓﹥淇婇悙顏勨偓鏍暜閹烘鍥级濡潧缍婂畷鍗炩枎閹寸媴绱抽梻浣侯焾閺堫剟鎳濇ィ鍐ㄧ劦妞ゆ帊鐒﹂崐鎰偓瑙勬礃閸旀牠藝閻楀牊鍎熼柨婵嗘川閸旇泛鈹戦悙瀛樺鞍闁糕晛鍟村畷鎴﹀箻缂佹ê鐧勫┑鐘绘涧椤戝棝鍩涢幋鐐簻闁瑰搫妫楁禍鍓х磽娴ｅ壊妲归柟绋垮暱椤曪綁宕ㄦ繝鍐€撶紓渚囧灡濞叉﹢寮埀顒勬⒒娴ｈ櫣甯涢柨姘舵煟閵堝懏澶勭紒鏃傚枎椤粓鍩€椤掑嫬钃熼柨鏇炲€哥粈鍐┿亜韫囨挸顏柣搴″⒔缁辨挻鎷呴搹鐟扮闂佺儵鏅╅崹鍫曟偘椤旈敮鍋撻敐搴℃灍闁稿﹦鍏橀弻銈囧枈閸楃偛顫╂繝娈垮枟閻撯€愁潖缂佹ɑ濯村〒姘煎灣閸旂顪冮妶鍡楃仴婵☆偅绻堥悰顕€骞嬮敃鈧悙濠冦亜閹哄棗浜鹃梺鍝勵儎缁舵岸寮婚悢鍏肩劷闁挎洍鍋撴鐐搭殜閺屾稒鎯旈敐鍛€剧紓浣虹帛缁诲牆螞閸愩劉妲堟繛鍡樺姈閸婄兘姊绘担鍛婃儓妞ゆ垵鍟村畷鎰板冀椤愶絽搴婂┑鐘绘涧閻楀棝寮搁崼鐔剁箚妞ゆ牗绋掗妵鐔哥箾閸忕厧鐏存慨濠冩そ瀹曟粓鎳犻鈧敮銉︾箾鐎涙鐭ゅù婊勭矒閹箖鎮滈挊澶岊吅闂佹寧娲嶉崑鎾剁磼閻樺搫鍚圭紒杈ㄦ崌瀹曞ジ濮€閻樻ǜ鍎崇槐鎺楁偐閸愭彃鎽靛┑顔硷攻濡炶棄螞閸愩劉妲堟慨姗嗗墻閺嗩偅绻濋悽闈涗粶闁活亙鍗冲畷鎰板即閵忕姵杈堥梺鍐叉惈閹冲繘鍩涢幒鎳ㄥ綊鏁愰崟顕呭妳闂佺粯甯為崑鎾诲Φ閸曨垰绠ｆ繝闈涙祩濡倗绱撴笟鍥ф灍闁荤啿鏅犻悰顔嘉熼崗鐓庣彴闂佽偐鈷堥崜锕傚船瑜版帗鈷掑〒姘ｅ亾婵炰匠鍛床闁圭儤鎸搁崹鏃€銇勯幘璺哄壉闁绘帊绮欓弻鏇熺箾閻愵剚鐝曢梺缁樻尭閸熶即骞夌粙娆剧叆闁割偅绻勯ˇ顓㈡⒑缂佹ɑ顥堥柡鍛板皺閹广垽宕卞☉娆忊偓鍨箾閹寸偟鎳愰柣鎺嶇矙閺岋綁鎮㈡搴Ｐㄩ梺鍝勮嫰缁夌兘篓娓氣偓閺屾盯骞樼€靛憡鍣板銈冨灪瀹€鎼佸极閹邦厼绶炲┑鐘插閸熷淇婇悙顏勨偓鏍ь潖婵犳艾鐓曢柛顐ｇ箥閻掕棄鈹戦悩鍙夊闁抽攱鍨块弻锟犲磼濡搫濮曞┑鐐叉噹閹虫﹢寮诲☉銏″亞濞达絽鎽滄禒鎼佹⒑鐠団€虫灓闁轰礁顭烽悰顔芥償閵婏箑娈熼梺闈涱槶閸ㄨ櫣鈧俺妫勯埞鎴︽倷閼搁潧娑х紓鍌氱М閸嬫挸顪冮妶搴′簻妞わ箓娼ч悾鐑藉箣閿旇棄浜圭紓鍌欑劍椤洭宕㈤柆宥嗙厵闁稿繐鍚嬮崕妤呮煕閻樺磭澧柍璇茬Т椤撳ジ宕堕敐鍛濠电偛鐗嗛悘婵嬪几閻斿吋鐓熼柟鍨缁♀偓閻庤娲樺浠嬪极閹剧粯鍋愰柟缁樺笧閻涒晜淇婇悙顏勨偓鏍箰閻愵剚鍙忛柣銏犳啞閸婂灝螖閿濆懎鏆為柍閿嬪灴閺岋綁鎮㈤崨濠勫嚒闂佽鍠楅崹鍧楀蓟閿濆鏅查幖瀛樼箞閸嬫鎮楃憴鍕缂佽鍊块、姗€宕楅悡搴ｇ獮婵犵數濮寸€氼剟鐛崼銉︹拻濞达絼璀﹂弨浼存煙濞茶閭慨濠佺矙瀹曠喖顢涘鎲嬬幢闂備焦瀵х换鍌炈囨导瀛樺亗闁哄洢鍨洪悡蹇擃熆鐠轰警鍎忛柣蹇嬪劦閺屾盯鎮㈤崫鍕垫毉濡炪們鍔婇崕闈涚暦閸洦鏁嗗ù锝呭级鐎氬ジ姊绘笟鈧鑽も偓闈涚焸瀹曘垺绂掔€ｅ灚鏅滈梺缁樻濞咃絿澹曢悾灞稿亾楠炲灝鍔氶悗姘煎枤缁綁寮崒妤€浜炬繛鍫濈仢閺嬫稒銇勯鐘插幋鐎规洘妞藉畷鐔碱敍濮橀硸妲伴梻浣哥枃濡椼劎娆㈤敓鐘茬劦妞ゆ帊鐒﹀畷宀勬煛瀹€瀣М闁诡喓鍨藉畷顐﹀Ψ閿曗偓濞呮垿姊虹拠鎻掝劉闁告垵缍婂畷婊堟偄閻撳孩妲梺閫炲苯澧柕鍥у楠炴帒顓奸崶鑸敌滃┑鐘愁問閸犳牜绮旇ぐ鎺戣摕闁挎稑瀚▽顏堟煟閿濆懐娼＄憸宥夊煘閹达附鏅柛鏇ㄥ亜楠炲顪冮妶鍐ㄧ仾缂佸鍨块垾锕傚Ω閳轰礁绐涘銈嗘⒒閻℃棃宕畝鍕拻濞达絿鐡旈崵娆愭叏濮楀牏鐣甸柨婵堝仦瀵板嫭绻涢幒鎾淬仢鐎殿喕绮欓、姗€鎮欏畵顔兼处閻撴瑩姊婚崒姘煎殶妞わ讣濡囩槐鎺楁偐瀹曞洤鈷岄梺鍝勬湰濞叉繄绮诲☉姘ｅ亾閿濆簼绨撮柛瀣崌瀵挳鎮㈡總澶婃闂備胶绮…鍥╁垝椤栫偞鍋傞柡鍥ュ灪閻撴盯鏌涢妷顔惧帒妞ゅ繐鎳嶇换鍡涙煠濞村娅嗛柛鐘冲姍閺屸剝寰勬惔銏€婄紓浣哄Ь鐏忔瑧妲愰幒鏃傜＜婵☆垵鍋愰悿鍕⒑鐠団€虫灆缂侇喗鐟ヨ灋闁告劦鐓佽ぐ鎺斿彆闁圭粯甯掓慨锕傛⒑閸濆嫬顦柛鎾寸箞楠炲繘宕ㄩ弶鎴濈獩婵犵數濮撮崐鐟扳枔濮椻偓濮婄粯绗熼埀顒勫焵椤掍胶銆掗柍瑙勫浮閺屾盯寮埀顒勫垂閸ф宓侀柛鎰电厛閻撱儵鏌涢銈呮瀻闁谎冨缁绘繈濮€閿濆棛銆愬銈嗗灥濞差參宕洪埀顒併亜閹烘埈妲稿褍鐡ㄩ幈銊︾節閸愨斂浠㈤悗瑙勬磸閸斿秶鎹㈠┑瀣闁靛瀵屽鏃堟⒒閸屾瑧鍔嶉悗绗涘厾楦跨疀濞戞锛熼梻鍌氱墛缁嬫捇寮抽敃鍌涚叆婵犻潧妫涙晶銏ゆ煟閵堝倸浜鹃梻鍌欑閹碱偊宕愭禒瀣垫晩濠电姴瀚慨鍐测攽閻樺磭顣查柍閿嬪灴閹嘲鈻庤箛鎿冧患闂佸憡鏌ｉ崐妤呭焵椤掑喚娼愭繛璇х畵瀹曟粓鎮㈤悡搴ｇ暫濠殿喗銇涢崑鎾绘煕閳哄绡€鐎规洘锕㈤、鏃堝椽閸愵亞顢呴梻鍌氬€峰ù鍥敋閺嶎厼鍨傞幖杈剧磿閺嗗棝鏌嶈閸撶喎鐣烽妷褉鍋撻敐搴℃灍闁抽攱鍨块弻娑樷攽閸℃浼€闂佽绻樻禍鍫曞蓟濞戙垺鍋愮€规洖娲ら埅褰掓⒑娴兼瑧鍒伴柛銏＄叀閳ワ箓濡搁埡浣歌€块梺鍐叉惈閸婃劙顢楅崟顑芥嫼濠殿喚鎳撳ú銈夋倿濞差亝鐓曢柕濞炬櫃閹查箖鏌熼姘伃妞ゃ垺鐩幃娆撴嚑閼稿灚鍟洪梻鍌欑劍鐎笛呮崲閸岀倛鍥敍濠婂懍绗夋繝鐢靛У绾板秹宕愰崹顐ょ闁瑰鍋熼幊鎰版煟閹烘洖袚闁靛洤瀚伴弫鍌炲垂椤旇偐銈繝娈垮枛閿曘儱顪冮挊澶屾殾妞ゆ劧绠戠粈瀣亜閺囩偞鍣洪柦鎴濐樀濮婄粯鎷呴崨濠傛殘濠殿喖锕ょ紞濠傜暦瑜版帗鍋ㄩ柛鎾冲级閺咁亪姊洪幐搴ｇ畵妞わ缚绮欏顐も偓锝庡枟閻撳啰鎲稿鍫濈婵炲棙鎸婚崑鈺呮煟閹达絾顥夌紒鈧崼婢濆綊鏁愰崶銊ユ畬缂佸墽铏庨崹璺侯潖閾忓湱纾兼俊顖濇娴犳悂姊洪幐搴㈢５闁哄懐濮撮悾鐑筋敆閸曨偆顔岄梺鐟版惈濡瑩寮埀顒勬⒑閸︻厼鍔嬪┑鐐诧工閻ｇ兘骞囬鈺傛⒐閹峰懘鎮烽弶澶哥礋闂傚倷鑳剁划顖炲垂閻撳宫娑㈠礋椤撶儐妫滄繝鐢靛У绾板秹鎮￠悢鍏肩厵闂侇叏绠戦悘娑㈡煃瑜滈崗姗€宕戦幘缁樷拺闂侇偆鍋涢懟顖涙櫠閸撗呯＜闁绘娅曠亸顓㈡煟閿濆洤鍘寸€规洖銈稿鎾倷闂堟稑绠伴梻鍌欒兌椤牏鎮锕€纾归柡宥庡亞缁€濠冧繆閵堝懏鍣洪柍閿嬪笒闇夐柨婵嗘噺閸熺偤鎮归幇鍓佺瘈闁哄本绋掗幆鏂库槈濡嘲浜炬繝闈涱儏杩濋梺鍛婂姦閸犳牠鐛姀锛勭闁瑰鍎愰悞浠嬫煥濞戞瑧娲存慨濠呮閹叉挳宕熼顐ｎ棆濠电姭鎷冮崟鍨杹闂佽鍣换婵嬪极閹邦厼绶為悘鐐舵缁插ジ姊绘担瑙勫仩闁稿海鏁昏棢闁规崘顕х粈鍡涙煛婢跺绱╅柣鐔煎亰閻撱儵鏌涢埄鍐︿簼闁规儳鐓勬惔銊ョ倞鐟滄繈鐓浣典簻闁靛繆鍓濈粈瀣攽椤旂懓浜鹃梻浣虹帛椤牆鈻嶉弴銏╂晩闁圭儤鎸剧弧鈧┑鐐茬墕閻忔繈寮稿☉銏＄叆闁哄洦锚閸旀碍銇勯鍕殻闁圭锕ュ鍕沪閻愵剦鍟庡┑锛勫亼閸婃牠宕濊缁骞嬮悩鐢电劶闁诲函缍嗛崑浣圭濠婂牊鐓欓柛婵嗗鑲栭梺鍛婃煥缁夊綊骞冨Δ鈧～婵嬵敆閸岋妇绀婄紓鍌欐祰妞存悂骞戦崶褏鏆﹂柟鐑樺灍閺嬪酣鏌熼幖顓炲箺鐞氾箑鈹戦敍鍕杭闁稿﹥鐗犲畷褰掓濞磋櫕绋戦埞鎴﹀幢濞嗘劖顔曢柣鐔哥矌婢ф鏁幒妤佺叆闁靛牆妫旂换鍡涙煏閸繂鈧憡绂嶆ィ鍐┾拺闁告繂瀚銉╂煕鎼达絾鏆€殿喖顭峰鎾偄妞嬪海鐛繝鐢靛仦閸ㄨ泛顫濋妸鈺佹辈闁绘鏁哥壕钘壝归敐鍥剁劸妞わ絾濞婇弻娑氣偓锝冨妼閳ь剚绻傞锝嗙節濮橆厼浜滈梺绋跨箺閸嬫劙宕濋悜鑺モ拺闁圭瀛╃壕鐢告煕鐎ｎ偅灏い顓″劵椤︽潙顭胯椤ㄥ﹥淇婇悽绋跨妞ゆ牗鍑瑰濠囨⒑缂佹◤顏堝疮閸喒鏋旀俊銈傚亾闁宠鍨块、娆戞兜閻戠晫鍙嶆繝鐢靛仜閹锋垹寰婇崹顔ワ綁骞囬弶璺唺闂佺懓鍟跨壕顓㈠窗閺嵮呮殾妞ゆ劧绠戠粈瀣煕椤垵浜炵紒瀣喘濮婂宕掑▎鎰偘濡炪倖娉﹂崨顔煎簥闂佸綊鍋婇崰妤€鐣烽弻銉︾厵閺夊牓绠栧顕€鏌涚€ｅ墎绡€闁哄苯绉瑰畷顐﹀礋椤掆偓濞咃繝姊洪柅鐐茶嫰閸樺摜绱掗埀顒佺瑹閳ь剟宕洪姀鈩冨劅闁靛鍎抽鎺楁倵鐟欏嫭绀€婵炲眰鍊濋崺鈧い鎺戝€告禒婊勩亜椤忓嫬鏆ｅ┑鈥崇埣瀹曞崬螖閸愵亝鍟伴梻浣藉吹婵娊鎮為敃鍌涘亗闁跨喓濮峰畵渚€鐓崶銊︾缁炬儳鍚嬫穱濠囶敍濠靛棔姹楀銈嗘⒐濞茬喖寮婚埄鍐ㄧ窞濠电姴瀚。鐑樼節閳封偓閸屾粎鐓撻悗瑙勬礃绾板秶鈧絻鍋愰埀顒佺⊕椤洭宕㈤悽鍛婄厽闁绘ê寮堕崢鍌炴煕濞戝崬鐏ｆ俊鎻掓处娣囧﹪濡堕崶顬儵鏌涚€ｎ偆鈽夐摶鐐寸節闂堟稒顥犻柡鍡畱閳规垿宕掑搴ｅ姼闁哥儐鍨跺娲箰鎼粹懇鎷归梺绋垮婵炲﹪鎮伴鍢夋梹鎷呮搴ｇ暰闂備胶绮崝锔界濠婂牆鐒垫い鎺嶈兌婢у灚顨ラ悙鏉戝闁靛牞缍佸畷姗€濡歌缁辩敻姊绘担鍝ョШ闁稿锕畷鏇㈡偨閸涘﹥娅滄繝銏ｆ硾椤戝棝宕曢鍫熲拺闂傚牃鏅涢惁婊堟煕濮椻偓缁犳牠寮鍜佺叆闁告劗鍋撶€靛矂姊洪棃娑氬婵☆偅鐟╅崺娑㈠箳濡や胶鍘撻悗鐟板婢瑰棙鏅堕敃鍌涚厵妞ゆ洖妫涚弧鈧悗瑙勬礃椤ㄥ牓宕版繝鍐╃秶妞ゎ厽鍨甸弲顒勬⒒閸屾瑨鍏岀紒顕呭灦瀹曟繈寮介鐐电暰閻庡厜鍋撻柛鏇ㄥ墮閳ь剙鐏濋湁闁绘ê妯婇崕鎰版煟閹惧鎳冩い顏勫暟閳ь剨缍嗘禍顏堫敁濡ゅ懏鐓冮悹鍥皺婢э箓鏌″畝鈧崰搴ㄦ偩閻戣棄鐐婄憸澶愬几閸涘瓨鈷戠痪顓炴噺閻濐亞绱掗鑺ュ碍闁伙絿鏌夐妵鎰板箳濠靛洦娅囬梻渚€娼х换鍡涘礈濠靛鍎婇柟鐑橆殕閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ剚鍠愰幖娣妸閳ь剙鍟存俊鐑藉煛娴ｉ鐐婇梻渚€娼ч敍蹇涘磼濠婂懏鍠掗梻浣筋嚙妤犲摜绮诲澶婄？闂侇剙鍗曢崶顒夋晬婵犲﹤鍠氬Λ婊堟⒑缁夊棗瀚峰▓鏇㈡煃闁垮鐏﹂柕鍥у楠炴帡宕卞鎯ь棜闂傚倷绀侀幉锟犮€冮崱妞曟椽鎮㈡搴㈡闂佸壊鍋呭ú锕傚极閸℃鐔嗛悹杞拌閸庢劖绻涢崨顔惧⒌婵﹦绮幏鍛存惞閻熸壆顐奸梻浣告啞濮婂綊鎮ч弴鈶┾偓锕傚炊瑜夐弸搴ㄦ煙闁箑娅樻繛鑼焾閳规垶骞婇柛濠冨姍瀹曟垿骞樼紒妯煎帗闁荤喐鐟ョ€氼剟鎮橀幘顔界厵妞ゆ梻鏅幊鍥┾偓娈垮枛閻栧ジ鐛€ｎ喗鍋愰弶鍫厛閺佸洭姊婚崒姘偓椋庣矆娴ｅ搫顥氭い鎾卞焺閺佸嫰鏌￠崶銉ョ仼缁炬崘顫夌换娑㈠箣濞嗗繒浠兼俊妤€鎳樺娲捶椤撶儐鏆┑鐘灪椤洨鍒掓繝姘闁兼亽鍎抽崢鐢告⒑鐠団€崇€婚柛娑卞枟閸犳牠姊绘担铏瑰笡缂佽鍟换娑欑節閸屻倖缍庣紓鍌欑劍钃卞┑顖涙尦閺屾稑鈽夊鍫濅紣闂佸搫妫楅悧濠勬崲濞戙垹绠婚悗闈涘閺嗏€愁渻閵堝啫濡奸柨鏇樺€濋幃楣冩煥鐎ｎ亶鍤ら梺鍝勵槹閸ㄧ敻宕妸銉富闁靛牆妫欑亸鐢告煕鐎ｎ剙浠︽繛鐓庣箻瀹曞ジ濡烽敂瑙勫闂備礁鎲￠幐鏄忋亹閸愨晝顩叉繝闈涚墢绾惧吋绻涘顔荤敖闁伙綀娅ｉ埀顒侇問閸犳捇宕濆鍥╃焿闁圭儤鏌￠崑鎾绘晲鎼粹€茬敖闂佸憡眉缁瑥顫忔ウ瑁や汗闁圭儤鍨抽崰濠囨⒑閹肩偛濡洪柛妤佸▕楠炲棝宕橀闂寸炊闂佸憡娲滈弫鎼佸船閻㈠憡鍋℃繝濠傚缁犳绱掓潏鈺佷沪缂佹鍠栭崺鈧い鎺戝瀹撲線鏌涢幇鈺佸闁绘梻鍎ゅ畷澶愭煏婵炑冨缁额偊姊婚崒娆戭槮闁圭⒈鍋婂畷顖烆敃閿曗偓绾惧湱鎲搁悧鍫濈瑨闂傚偆鍨遍妵鍕棘鐠恒劍鐧侀梺琛″亾濞寸姴顑嗛悡鍐煏婢跺牆鍔氶柡鍡氫含缁辨帡鎮▎蹇斿闁绘挻娲熼弻锟犲礃閿濆懍澹曢梻浣藉吹閸熷潡寮查悩璇茬畺濞村吋鎯岄弫濠囨煕閵忕媭妲洪柛鐘虫尰缁傚秹骞栨担绋垮敤閻熸粌鏈粩鐔煎即閻愨晜鏂€闂佺粯鍔栧娆撴倶閿斿浜滈煫鍥风导闁垱銇勯姀鈩冾棃鐎规洖銈搁、鏇㈡晲閸℃褰呴梻鍌氬€烽懗鍫曞箠閹惧瓨娅犻柣锝呰嫰閸ㄦ繃銇勯弽顐粶闁绘挻娲熼弻鐔告綇妤ｅ啯顎嶉梺缁樻尰濞叉鎹㈠☉銏犵闁绘垵娲ら崣鏇㈡⒑閸涘﹥鈷掗柛鐘虫尵濡叉劙骞掑Δ浣镐汗闂佹儳娴氶崑鍕閹惰姤鈷戦悹鍥ｂ偓铏亶濡炪們鍔岄幊姗€鏁愰悙娴嬫斀閻庯絽鐏氶弲銏＄箾鏉堝墽鍒伴柟璇х節閹偓绻濆顓涙嫽婵炶揪缍€婵倝濡撮崘顔界厽闁硅櫣鍋熼悾鐢碘偓瑙勬礃缁诲牆顕ｉ崐鐕佹闂佹悶鍊栭〃濠囧蓟濞戙垹鍗抽柕濞垮劚缁犱即姊虹粙娆惧剱闁圭懓娲顐﹀箛椤撶喎鍔呭┑鐘绘涧閻楁劙宕楅幒鏃傜＝闁稿本鑹鹃埀顒佹倐瀹曟劘銇愰幒鎴狀唶缂傚倷鐒﹂…鍥煘瀹ュ應鏀介柣妯哄级婢跺嫰鏌涙繝鍥ㄦ暠闁靛洤瀚粻娑㈠箻閹颁椒妲愰梻浣侯焾椤戝棝骞戦崶褜鍤曞ù鐘差儛閺佸洭鏌ｉ弮鍥ㄨ吂缂傚啯娲熷缁樻媴缁涘缍堥悗瑙勬礃閿曘垽銆佸鎰佹Ь婵犮垼顫夊ú婊堝箟閹绢喖绀嬫い蹇撴閻ｉ箖姊绘笟鈧褔鎮ч崱娑樼疇閹兼番鍔屽Ч鍙夌箾閸℃绠氶柡鈧懞銉ｄ簻闁哄洨鍋為崳鐟邦熆瑜庨幐鎶藉蓟閿涘嫪娌柣锝呯潡閵夛负浜滅憸宀€娆㈠璺鸿摕婵炴垯鍨圭粻濠氭偣閾忕懓鍔嬮柣蹇撶墕铻栭柣姗€娼ф禒婊堟煕閻曚礁浜柣蹇撳暣濮婃椽鏌呴悙鑼跺濠⒀勬尦閺屾盯鍩為崹顔句紙濡ょ姷鍋為…鍥箯閻樿绠甸柟鐑樻煛閸嬫捇顢橀悜鍡樺瘜闂侀潧鐗嗗Λ娆撳煕閹烘鐓涢柛婊€绀佹禍婵堢磼閸屾稑绗уù鐙呯畵瀹曪綁濡疯閻ｉ箖姊绘担铏瑰笡闁告棑闄勭粋宥咁煥閸繄鍔﹀銈嗗笂閼宠埖鏅堕鍫熺厓缂備焦蓱椤ュ牓鏌℃担绋挎殻鐎规洘甯掗～婵嬪础閻愨晛浜鹃柣鎰劋閸嬧剝绻濇繝鍌氭殶缂佺姾宕甸埀顒冾潐濞测晝绱炴笟鈧畷娲焵椤掍降浜滈柟鍝勬娴滈箖姊虹€圭媭娼愰柛銊ユ健楠炲啴鍩￠崪浣规櫓闂佸吋绁撮弲娆戞濮椻偓濮婄粯鎷呴搹骞库偓濠囨煛閸涱喚鐭掗柟顔ㄥ洦鍋愰柤纰卞墯濞堟儳鈹戦悩缁樻锭妞ゆ垵鎳樺畷锟犳惞椤愮姳绨诲銈嗗姦閸嬪嫰寮搁妶鍥╃＜閻庯綆浜炵粻缁樻叏婵犲啯銇濈€规洏鍔嶇换婵嬪礋閵婏富娼旈梻鍌欑椤撲粙寮堕崹顕呮綆闂備浇顕栭崳顖滄崲濠靛棛鏆︽慨妞诲亾妞ゃ垺鐟╅幃鍓т沪閽樺鐟查梻鍌欑閹碱偊藝闁秴纾婚柣鎰嚟閻濆爼鏌涢埄鍐巢闁搞儺鍓氶弲婵嬫煕鐏炲墽銆掗柛妯绘倐濮婅櫣鍖栭弴鐐测拤闂佽崵鍠嗛崕鑼矉閹烘鐒肩€广儱妫涢崢鎼佹倵閸忓浜鹃柣搴秵閸撴瑩宕哄畝鍕拺閻庡湱濯鎰版煕閵娿儳浠㈤柣锝囧厴瀹曞ジ寮撮悙宥佹櫇閹茬顭ㄩ崗鎾呯悼閹叉挳宕熼鐘垫婵犵數鍋涢悧鍡涙倶濠靛鍑犳繛鎴欏灪閻撱儵鏌￠崶鏈电盎妞も晩鍓熼弻娑㈠箳閹捐櫕璇炲銈冨灪閻╊垶骞冨▎鎾村殤妞ゆ帒顦弫鎼佹⒒閸屾瑧顦﹂柟娴嬪墲缁楃喎螖閸涱厼鐎梺瑙勫劶婵倝宕曞Δ浣虹闁糕剝蓱鐏忎即鏌ｉ幘瀵告噮缂佽鲸甯為埀顒婄秵娴滄繈宕戦妷锔轰簻閹兼番鍩勫▓婊堟煛鐏炵晫啸妞ぱ傜窔閺屾盯骞欓崟顓犳殼閻庤娲濋～澶婎焽韫囨稑鐓涢柛灞捐壘缁ㄣ儲绻濋悽闈涗沪闁搞劌鐖煎畷娲礃椤旇偐锛涢梺鍦亾閺嬬厧危閸喓绠鹃柛鈩冿供閻掍粙鏌涢弮鍌氬幋婵﹤鎼叅閻犲洦褰冪粻鐟扳攽閳藉棗浜濈紒瀣尭鍗遍柟鐗堟緲缁犺櫕淇婇妶鍜冩敾闁哄應鏅犲鐑樺濞嗘垵鍩岄梺鍝勭墱閸撶喎鐣风€圭媭妯勫┑顔硷功閸庛倗鈧數鍘ч埢搴ㄥ箣閻愯弓杩橀梻鍌欒兌椤牏鎹㈤幋锔芥櫔婵＄偑鍊栧ú鈺冪礊娓氣偓閻涱喖顫滈埀顒勩€佸▎鎴濇瀳閺夊牄鍔庣粔閬嶆⒒閸屾瑨鍏岀紒顕呭灥閹筋偄顪冮妶鍡樷拹闁绘濮撮悾鐑筋敆閸曨偆顔掑銈嗘琚欓柟椋庣帛缁绘稒娼忛崜褏袣濠碘槅鍋勭€氼垶銆傞崸妤佲拻濞达絿鎳撻婊呯棯閺夎法效濠碉紕鏁诲畷鐔碱敍濞戞瑦鐝栭梻浣侯焾閺堫剟鎮烽敃鍌氱獥婵鍩栭悡銏′繆椤栨繂鍚圭紒鐘靛仱閺岋紕浠﹂悾灞澭呪偓瑙勬处閸嬪﹤鐣烽悢纰辨晢闁逞屽墮閳诲秹濡舵径瀣ф嫼闂佽鍎兼慨銈夊极闁秵鐓曢柕濞垮劜閸嬨儲顨ラ悙鎻掓殺闁靛洦鍔欓獮鎺楀箣閻樺灚娈洪梻鍌欑濠€閬嶅磿閵堝鍨傞柣銏㈢《閳ь剚鐗犲畷濂稿Ψ閿旇瀚奸梻浣告啞缁诲倻鈧氨鍏樺畷鏇㈠箛閻楀牏鍘搁柣蹇曞仩椤曆勬叏閸岀偞鐓曢柍鍝勫暙娴犺鲸顨ラ悙宸剶闁轰礁鍊荤槐鎺懳熺紒妯煎綗闂傚倸鍊烽懗鍓佸垝椤栫偛绀夐柨鏇炲€哥粈鍫熸叏濮楀棗鍔柟鐑橆殔闁卞洭鏌曟径娑滃悅闁圭柉娅ｇ槐鎾寸瑹閸パ呬画濠电偛寮堕敋闁宠绉瑰畷鍗炩槈濞嗘垵骞楅梻浣稿暱閹碱偊鏁冮妶澶嬪€堕柨鏇炲€归悡鐔哥箾閹存繂鑸归柡瀣ㄥ€濋弻宥堫檨闁告挶鍔庣槐鐐哄幢濡⒈娲搁梺鍝勭▉閸樿偐绱掗埡浼卞綊鎮╁顔煎壉闂佺粯鎸诲ú鐔煎蓟閻斿吋鍤嬫い鎺嗗亾濠德ゅГ缁绘盯宕ㄩ鐕佹＆闂佸搫澶囬崜婵嗩嚗閸曨厸鍋撻敐搴′簻闁逞屽墯閸旀牠骞堥妸锔剧瘈闁告洦鍘肩粭锟犳⒑閻熸澘妲婚柟鍐茬箳缁參鎮㈢喊杈ㄦ櫖濠电姴锕ら崯顐ｇ搹闂傚倸鍊搁崐椋庣矆娓氣偓楠炴牠顢曢敂钘変罕濠电姴锕ら悧鍡欑矆閸喓绠鹃柟瀛樼懃閻忊晝绱掗幇顓ф當闁宠鍨块幃鈺呭箵閹哄秶鏁栭梻浣告啞閼归箖顢栭崨绮光偓锔炬崉閵婏箑纾梺缁樼濞兼瑦鎱ㄥ☉銏♀拺闁告繂瀚€氫即鏌ｅΔ浣瑰碍妞ゎ偄绻橀幖褰掑捶椤撶媴绱叉繝纰樻閸ㄤ即骞栭锔肩稏閻忕偟鐡斿〒濠氭煏閸繃顥炲璺哄閺屾稑螣閸濆嫧鎸冮梺鍛婂笚鐢偟妲愰幒鎳崇喓绮欐径鍝ュ嚬闂傚倷绀侀幉锟犲礉韫囨稑鐤炬繝闈涱儏閸屻劑鏌涘Δ鍐ㄤ汗闁衡偓娴犲鐓熼柟閭﹀幗缂嶆垿鏌ｈ箛瀣姢闁逞屽墲椤煤閿曞倸绀堥柣鏂款殠閸ゆ洟鏌熼梻瀵割槮閸ュ瓨绻濋姀锝嗙【妞ゆ垵娲畷銏ゆ寠婢舵ɑ瀵岄梺闈涚墕濡瑧浜搁悽鍛婄厱闁绘ɑ鐓￠妤呮婢跺浜滈柡鍥殔娴滈箖姊洪崫鍕槵闁逞屽墮绾绢參寮抽崱娑欏€甸柨婵嗛婢т即鏌ㄥ☉姘瀾缂佺粯绋撻埀顒傛暩椤牓顢撻幘鍓佺＜闁绘娅曠亸顓㈡煟閿濆懎妲绘い顓滃姂瀹曢亶鍩￠崒鍌樺劜缁绘繄鍠婂Ο鍝勨拤閻熸粍婢橀崯鎾箖瑜旈獮妯兼嫚閼艰埖鎲伴柣鐔哥矊缁绘帒危閹版澘绠抽柟鍐茬－閸犳牠骞冮埄鍐╁劅婵☆垵顕ч顖炴⒒閸屾艾鈧绮堟笟鈧獮鏍敃閿旇棄娈ｅ銈嗙墬缁酣鎯岄幘缁樼厽闁硅揪闄勯幊澶愭煏婵犲繐顩柣鐔风秺閺屽秷顧侀柛鎾跺枎椤曪絿鎷犲ù瀣潔闂侀潧绻掓慨鐑筋敊閹烘鐓熼柣妯煎劋椤忕娀鏌涙惔娑樷偓婵嬪箖濡や胶绡€婵﹩鍘搁幏鐑樼箾閺夋垵鎮戦柣鐔濆洤绠栧┑鍌氭啞閻撴洟鐓崶銊︻棖闁兼澘娼￠弻鏇㈠幢閺囩媭妲梺瀹犳椤﹀灚鎱ㄩ埀顒勬煃閵夛附鐏遍柛瀣崌閹粓鎳為妷褍骞愰梺璇茬箳閸嬬娀顢氳瀹曟繂顭ㄩ崼鐔哄幐闂佺硶鍓濋〃鍡涘闯閾忓湱纾肩紓浣诡焽缁犳挻銇勯弴妯哄姦闁哄被鍔庨埀顒婄秵閸嬪棝宕欓敓鐘斥拺闂侇偆鍋涢懟顖涙櫠椤栫偞鐓欑紒瀣仢閳锋棃鏌涢幒鎾虫诞鐎规洖銈搁幃銏㈢矙濞嗛敮鍋撻幘缁樷拺闂傚牃鏅涢惁婊堟煕濞嗗繘顎楅棁澶愭煕閺囥劌澧扮紒鈾€鍋撻梻鍌氬€搁悧濠勭矙閹达箑鐒垫い鎺嶇劍閸婃劖顨ラ悙宸█闁轰焦鎹囬幃鈺呮嚑椤掆偓楠炲牓姊绘担鐑樺殌妞ゆ洦鍘介幈銊︻槹鎼粹槅妫滈梺鑺ッˉ銏ｃ亹閹烘挻娅滈梺鍛婄矆閻掞妇绱炲Ο渚富闁靛牆鎳愮粻浼存煟濡も偓閿曨亜鐣烽幇鏉块唶闁哄洨鍠撻崢鍗炩攽鎺抽崐鏇㈠疮椤愶絿顩茬憸鐗堝笚閻撴盯鏌嶈閸撶喖骞婇悙鍝勎ㄩ柨婵嗗閻╁酣姊绘担鍛婃儓闁稿﹤婀遍埀顒傜懗閸パ呯暰闂佸壊鍋侀崕鏌ユ偂閸愵亝鍠愭繝濠傜墕缁€鍫熸叏濡潡鍝虹€规洘鐓￠弻娑樼暆閳ь剟宕曢幇鏉挎瀬閻庯綆鍠楅悡銉︾節闂堟稒锛嶆俊鍙夋倐閺岋箓宕橀鍕亪闂佸搫鏈ú妯侯嚗閸曨垰閱囨繝闈涙琚氶梻鍌欒兌椤㈠﹥鎱ㄩ妶鍚ゆ椽鎮㈡總澶嬬稁濠电偛妯婃禍婵嬎夐崼鐔虹闁硅揪缍侀崫鐑樸亜鎼粹剝顥炵紒缁樼箘閸犲﹤螣瀹勯澹曢梺鎯ф禋閸嬪嫰寮搁悩缁樺€甸悷娆忓绾炬悂鏌涢妸銊︻棄闁伙絿鍏橀弫鎾绘偐閸愭祴鍋撻悜鑺ョ厓闁告繂瀚埀顒€缍婂鍫曞箹娴ｅ厜鎷绘繛杈剧秬濞咃絿鏁☉銏＄厱闁哄啠鍋撻柣妤佹礋閳ワ箓宕惰閺嬪酣鏌熼悙顒佺稇闁逞屽墮閻栧ジ寮婚妸鈺佸嵆闁绘劖绁撮崑鎾广亹閹烘挸浜楅梺闈涱檧闂勫嫰宕ｈ箛鏂剧箚妞ゆ牗姘ㄦ禒銏ゆ煟閹炬潙濮嶉柡宀嬬秮楠炴﹢宕橀崣澶嬵啀闂備胶顢婄亸娆撯€﹂崼銉⑩偓锕傚Ω閳轰線鍞跺┑鐘绘涧閻楁粌危閼哥數绡€闁汇垽娼ф禒婊勪繆椤愶絿鎳囨鐐村姍楠炴﹢顢欓懖鈺佸Е婵＄偑鍊栫敮鎺楁晝閿曞倹鍋╅梺顒€绉甸悡鐔兼煥濠靛棛绠崇紒鈾€鍋撴俊銈囧Х閸嬫稓绮旇ぐ鎺嬧偓浣糕枎閹炬潙娈熼梺闈涱樈閸犳牠寮查鐐╂斀闁绘ê鐏氶弳鈺呮煕鐎ｎ剙浠滄い顓炴搐閳诲酣骞樼€圭姌鏇㈡煟鎼搭垳绉靛ù婊冪埣閹偤鎳為妷褏顔曢梺绯曞墲閿氶柣蹇婃櫅閳藉骞樺畷鍥嗐垽鏌嶇憴鍕伌闁诡喒鏅涢悾鐑藉炊閼稿灚顔愰梻鍌欒兌缁垶骞愰悙顒傜闁逞屽墴閺岋紕浠﹂崜褉妲堥梺瀹犳椤︻垶锝炲鍫濆耿婵炲棗绻愮徊楣冩⒒閸屾瑧顦﹂柟鑺ョ矒瀹曠増鎯旈敐鍡楀簥闂佺懓顕慨闈涚暦閸欏绠鹃柟瀛樼懃閻忣亪鏌涢妶鍛殻闁哄苯绉靛顏堝箥椤旂厧顬夐梻浣筋嚙缁绘劙鎮ч崱娑樼厴闁硅揪瀵岄弫濠勭棯椤撱垺鏁遍柡浣瑰劤閳规垿鏁嶉崟顐″摋濠碘槅鍋勭€氫即骞冩ィ鍐╁€婚柤鎭掑劚閳ь剝宕电槐鎺戔槈濮楀棗鍓遍梺鍝勬嫅缂嶄礁顫忛搹鍦＜婵☆垰鎼～宥夋偡濠婂嫭绶查柛鐔告尦閸ㄩ箖寮介鐐茶€垮┑鐐村灦閻熴垽骞忕紒妯肩閺夊牆澧界粔顒併亜椤愩埄妯€鐎规洘鍨块幃鈺冪磼濡厧骞堝┑鐘垫暩閸婎垶宕橀埡浣诡仱濠电偞鍨堕幐鍝ョ矓瑜版帒钃熼柣鏃傚帶缁犳煡鏌熸导瀛樻锭婵炲牜鍘剧槐鎾存媴閸濆嫅锝夋煟濡ゅ啫鈻堢€殿喖顭峰鎾晬閸曨厽婢戦梺璇插嚱缂嶅棙绂嶉弽顓炵；闁规崘顕ч崡鎶芥煟濡吋鏆╅柣鎺戙偢濮婅櫣绮欑捄銊т紘闂佺顑囬崑銈夊箖閿熺姵鍋勯柛蹇氬亹閸樼敻姊虹拠鈥崇€婚柛婊冨暟缁€濠囨⒒娴ｅ憡鍟為柛銊╂涧閿曘垺娼忛埡鍌ゆ綗闂佸湱鍎ら〃鍛劔闁荤喐绮岄柊锝咁嚕閹剁瓔鏁嗗ù锝囨嚀瀵寧绻濋悽闈浶㈤柟鍐茬箻椤㈡棃鎮╁畷鍥╊啎闂佺懓顕慨鐢稿汲椤掑倵鍋撶憴鍕８闁告梹鍨块妴浣肝熺悰鈩冩杸闂佹悶鍎弲婊呯礊鎼淬劍鈷掗柛灞剧懄缁佹壆鈧娲滈弫璇茬暦閹达附鍊烽柣銏㈡暩閻撴捇妫呴銏″缂佸鍨规竟鏇㈠锤濡や讲鎷婚梺鍓插亞閸犳捇濡撮幒妤佺厸闁糕槅鍙冨顔剧磼缂佹绠栫紒缁樼箞瀹曟帒顫濋鐔烘澒闂傚倷娴囬妴鈧柛瀣尭闇夐柣妯烘▕閸庢劙鏌涙繝鍕毈闁哄被鍔岄埞鎴﹀幢濞戞墎鍋撳Δ鈧湁婵犲﹤瀚惌鎺楁煛鐏炲墽娲存鐐达耿瀹曪繝鎮欏顔界秵濠电姵顔栭崰鏍晝閵夈儺娓诲ù鐘差儑瀹撲線鏌熼柇锕€骞楅柛搴ｅ枛閺屻劌鈹戦崱妯虹獩闂佸搫妫庨崐鏍ㄧ┍婵犲洦鍊锋い蹇撳閸嬫捁顦寸紒杈ㄦ尭椤繄鎹勯搹璇℃敤闂備浇顫夐崕鐓幬涢崟顖氬強闁靛濡囩粻楣冩煙鐎涙鎳冮柣蹇婃櫇缁辨帡鎮╅悜妯煎涧婵烇絽娲ら敃顏呬繆閸洖绀嬫い鏃傚帶鐢垶姊绘担鍛婂暈闁挎洏鍨虹粋宥夊醇閺囩偠鎽曢梺鎸庣箓閻楀繘鎮块埀顒勬⒑閸濆嫭宸濋柛瀣焽閸掓帡鎳滈悽鐢电槇闂佸啿鐨濋崑鎾绘煕鐏炲墽鐭岄柣鎾存尭铻栭柣姗€娼ф禒婊堟煥閺囥劋绨婚柣锝囧厴閹垻鍠婃潏銊︽珝闂備胶绮…鍥€傞鐐潟闁圭粯宸婚弨浠嬫煟閹邦垰鐓愮憸鎶婂懐纾奸柟缁樺笚閸嬨儲顨ラ悙璇ц含妤犵偞锕㈠畷娆撳级濞嗙偓楔闂侀€炲苯澧剧紓宥呮瀹曟澘螖閸涱喖浜楅梺鍛婂姦娴滄繈宕伴幇顓犵瘈濠电姴鍊绘晶鏇犵磼閳ь剟宕奸悢铏圭槇闂傚倸鐗婃笟妤呭磿濠婂懐纾界€广儱妫涙晶顏呫亜椤撯剝纭堕柟鐟板閹即鍨鹃幇浣圭秼濠电姷鏁搁崑娑樜熸繝鍐洸婵犲﹤鐗嗙粈鍐煃瑜滈崜娆撯€旈崘顔嘉ч柛鈩兠弳妤呮⒑閸濄儱孝闂佸府缍佸畷娲焵椤掍降浜滈柟鐑樺灥閺嗘瑩鏌ｉ幘鏉戝闁哄瞼鍠愮粭鐔煎垂椤旂⒈鐎抽梺鍙ョ串缂嶄線寮婚悢铏圭煓闁圭瀛╁畷鎶芥⒑闂堟稒顥為柛鏃€顨堝Σ鎰板箻鐎涙ê顎撻梺鍛婄箓鐎氬懘濡烽埡鍌滃幈闁诲函绲婚崝宀勫焵椤掍胶绠撴い鏇稻缁绘繂顫濋鈧畵鍡涙⒑缂佹ɑ顥嗘繛鍜冪秮椤㈡瑩寮撮姀鈾€鎷虹紓鍌欑劍閿氬┑顕嗙畵閺屾盯骞橀弶鎴濇懙闂佽鍠氶弫璇差嚕椤曗偓瀹曟帒顭ㄩ崪鍐棷婵犵數鍋犻幓顏嗗緤娴犲绠规い鎰跺瘜閺佷胶鈧厜鍋撻柛鏇ㄥ墰閸橀亶姊洪幐搴ｇ畵缂佺粯甯炵划鏃堫敊闁款垰浜炬繛鍫濈仢閺嬫稒銇勯銏℃暠濞ｅ洤锕幊婊堟濞戞氨鐛┑鐘垫暩婵鈧凹鍣ｅ鎶藉閵堝棌鎷绘繛杈剧到閹诧紕鎷归敓鐘崇厱閹煎瓨绋戦埀顒佺箓閻ｇ柉銇愰幒鎴濈€銈嗗姧缁茶棄顕ｉ崸妤佺厵闁稿繗鍋愰弳姗€鏌涢弬璺ㄐч柛鈺傜洴楠炲鏁傜憴锝嗗婵＄偑鍊栭崝鎴﹀磹閺囩喓顩锋繝濠傜墛閻撶姵绻涢懠棰濆殭闁诲骏绻濋弻锟犲川椤撶姴鐓熷銈冨灪閻熲晠骞冮幆褏鏆嗛柍褜鍓熼、娆撳即閻樼數锛滅紓鍌欓檷閸ㄧ懓顕ｉ濮愪簻闁靛闄勭亸鐢碘偓娈垮暙閸パ呭姦濡炪倖甯掔€氼參宕愰崹顐ょ闁割偅绻勬禒銏ゆ煛鐎ｎ偆鈯曢柕鍥у椤㈡﹢濮€閳╁啯娈稿┑鐑囩到濞层倝鏁冮鍫㈠祦闁哄秲鍔嶆刊鎾煕濠靛嫬鍔氭鐐村姇閳规垿鎮欓懜闈涙锭缂備焦褰冨锟犲灳閿曞倸閱囬柕蹇嬪灮閻掓儳顪冮妶鍡樷拻闁哄拋鍋嗗褔鍩€椤掑嫭鍊甸柛蹇曨焾瀹撳棝鏌￠埀顒勫础閻戝棛鍞靛┑顔姐仜閸嬫捇鏌涢埞鎯т壕婵＄偑鍊栫敮濠勭矆娴ｈ鍙忕€广儱娲犻崑鎾舵喆閸曨剛顦ㄩ梺鎼炲妼濞硷繝鎮伴鍢夌喖宕楅崗鐓庡姎濠电偠鎻徊鍧楀磿閵堝鍚归柍褜鍓欓—鍐Χ鎼粹€崇闂佸憡姊归崹鐢告偩閻戣姤鍋勭痪鎷岄哺閺呮繈姊洪棃娑氱濠殿喖鐭傞獮瀣倷閹殿喚鐣鹃梻浣虹帛閸旓附绂嶅鍫濈劦妞ゆ垶鍎抽埀顒佺墱缁顓奸崪浣哄弳闂佸壊鍋呯换鍕蓟閸儲鐓熼幖娣灮閳洟鎯囨径宀€纾奸悹鍥у级椤ャ垽鏌＄仦璇测偓妤冨垝濞嗘垶宕夐柕濞垮€楁す鎶芥⒒娴ｄ警鐒炬繛瀵稿厴瀹曚即寮介鐐舵憰閻庡箍鍎遍ˇ顖氭暜闂備線娼ч敍蹇擃吋閸モ晩妲告繝纰夌磿閸嬫垿宕愰弽褜娼栫憸鐗堝笒缁€澶嬬箾閸℃绂嬫繛鍏肩墱缁辨挻鎷呴懖鈩冨灦閸掑﹦鈧潧鎽滅壕鍏肩箾閹寸儑渚涢柛搴＄箲缁绘盯宕奸銏犵缂備浇椴搁幐濠氬箯閸涘瓨鎯為柣鐔稿椤愬ジ姊绘担瑙勫仩闁告柨鐬肩槐鐐寸節閸モ晛绁﹂梺纭呮彧缁犳垿锝為崨瀛樼厪闁割偅绻冮崳褰掓煠閺夎法浠㈤柍瑙勫灴閹瑩寮堕幋鐘辨闂備浇宕甸崰鍡涘磿閻㈢鏄ラ柍褜鍓氶妵鍕箳閸℃ぞ澹曢梻浣虹帛閻楁洟濡剁粙娆惧殨濠电姵纰嶉崑鍕煕韫囨洖甯堕柍褜鍓涚划顖炲箞閵娿儙鏃堝焵椤掆偓铻炴繛鍡樻尰閸嬧晠鏌ｉ幋锝呅撻柍閿嬪灴閺岀喖骞嗛弶鍟冩捇鏌℃笟鈧禍鍫曞蓟濞戙垹惟闁靛绠戞禒鎾倵濞堝灝鏋︽い鏇嗗洤鐓″璺侯煬閻撱儵鏌涘☉鍗炵仭婵犮垺鍨剁换婵嗏枔閸喗鐏嶉梺鎸庢磵閺呯姴鐣峰Δ鈧埥澶娢熼悙鎴濆悩閺冨牆宸濇い鏃囶潐鐎氬ジ姊婚崒姘偓鎼佹偋婵犲嫮鐭欓柟鎯х摠濞呯姵绻涢幋娆忕仾闁绘挻鐟╅弻娑樷槈濮楀牆浼愰梺宕囩帛濞叉粓鍩€椤掍緡鍟忛柛鐘崇墵閳ワ箓鎮滈挊澶嬬€梺鐟板⒔缁垶宕戦幇鐗堢厵缂備焦锚缁椦囨煟濞戞帗娅嗗ǎ鍥э躬閹瑩顢旈崟銊ヤ壕闁哄稁鍘奸拑鐔兼煏婵犲繘妾繛鍛Т闇夐柣妯烘▕閸庢劙鏌涚€ｅ吀閭柡灞剧洴瀵挳濡搁妷褌鐢婚梻浣虹帛閹稿爼宕归悜妯尖攳濠电姴娴傞弫宥嗙節闂堟稒顥滈柟顖滃仧缁辨挻鎷呴崫鍕戯綁鏌ｅΔ鍐ㄢ枅鐎殿喖顭峰鎾閻橀潧鈧偤鎮峰鍐фい銏℃椤㈡﹢鎮╅顫濠电偛鐗嗛悘婵嬪几濞嗘垹纾兼い鏃傛櫕閹冲洭鏌曢崱鏇犵獢鐎殿喗鎸抽敐鐐侯敊閸撗€妫ㄥ┑锛勫亼閸婃牠骞愭ィ鍐ㄧ獥閹兼番鍨归崹鏂棵归悡搴ｆ憼闁抽攱甯￠弻娑氫沪閸撗勫櫙闂佺绻愰張顒勫Φ閸曨垼鏁囬柣鎰版涧閳敻姊烘潪鎵槮闁哥喎鐡ㄦ穱濠囨嚋闂堟稓绐為柣搴秵娴滄牠宕戦幘缁樺殝闁割煈鍋勫鍨攽閳藉棗鐏ユ繛澶嬫礋瀹曞ジ顢旈崼鐔哄帗閻熸粍绮撳畷婊冣枎閹惧磭鏌堥柣搴㈢⊕鐪夌紒璇叉閺岋綁骞嬮敐鍡╂闂佺粯鎸婚惄顖炲蓟濞戞矮娌柟顖嗗懎濮查梻浣侯焾椤戝棝骞戦崶顒€绠栨繝濠傜墛閸ゅ秹鏌曟竟顖氬暙缁犺崵绱撻崒娆掑厡闁稿鎸搁…鍨熼搹瑙勬濡炪倖甯掔€氼剟宕掗妸鈺傜厵闂傚倸顕崝宥夋煟閹垮嫮绉柣鎿冨亰瀹曞爼濡搁敃鈧壕鎶芥⒑閸涘﹦鎳冮悗姘煎弮楠炲牓濡搁敂鍓х槇闂佸憡鍔忛弬鍌涚閵忋倖鍊甸悷娆忓绾炬悂鏌涢弬璺ㄐら柟骞垮灩閳规垹鈧綆浜為ˇ銊╂⒑閹稿海绠撴俊顐ｎ殜椤㈡棃宕妷褏锛濋梺绋挎湰閻熴劑宕楀畝鍕厱閻庯綆鍋呯亸顓熴亜椤撶偟浠㈤摶锝夋煠濞村娅囬柣鎾愁儔閺岋綁鎮㈤崫銉﹀櫑闁诲孩鍑规禍鐐哄箲閵忋倕骞㈡繛鎴炵懅閸樹粙姊洪棃娑氱疄闁糕晛瀚伴幃鐐哄礈瑜忕壕濂告煃瑜滈崜娑㈠焵椤掑﹦绉甸柛瀣╃劍缁傚秴顭ㄩ崼鐔哄幐閻庡箍鍎遍崯顐ｄ繆閸ф鐓冩い鏍ㄧ⊕缁€鍐磼缂佹娲寸€规洏鍔戦、姗€鎮ゆ担鐧哥礂闂傚倷绀侀幖顐︽儗婢跺瞼绀婂〒姘ｅ亾妤犵偛鍟撮崺锟犲川椤撶姷鍘┑鐘灱濞夋稒寰勯崶顒€鏋佺€广儱顦伴埛鎴︽偣閸ヮ亜鐨虹紒鐘冲缁辨帞绱掑Ο铏逛紝闂佽鍠氶崗姗€寮崒鐐茬鐟滃繘鎮為崸妤佲拺闁革富鍘奸崝瀣煛瀹€瀣瘈鐎规洘鍨块獮妯肩磼濮楀棙顥堟繝鐢靛仦閸ㄥ爼鎮烽敃鍌氱獥闁归偊鍠氱壕?/p>';
    return;
  }
  elements.terrainChangeList.innerHTML = items.map((item) => `
    <article class="item-card is-clickable ${isSelected("terrainChange", item.id) ? "is-selected" : ""}" data-terrain-change-card="${item.id}">
      <header>
        <div>
          <h3>${terrainChangeTypeLabel(item.changeType)}</h3>
          <small>${workAreaName(item.workAreaId)} / D${item.recordDay ?? 0}</small>
        </div>
        <span class="badge ok">${item.quantityId || "no-qty"}</span>
      </header>
      <p>${item.resultRef || "No result reference"}</p>
      <p>${item.notes || "No notes"}</p>
    </article>
  `).join("");
}

async function handleTerrainChangeSubmit(event) {
  event.preventDefault();
  const payload = {
    workAreaId: elements.terrainChangeWorkArea.value,
    quantityId: elements.terrainChangeQuantityId.value.trim(),
    spatialRawObjectId: elements.terrainChangeSpatialId.value.trim(),
    terrainRawObjectId: elements.terrainChangeTerrainId.value.trim(),
    changeType: elements.terrainChangeType.value,
    resultRef: elements.terrainChangeResultRef.value.trim(),
    recordDay: Number(elements.terrainChangeDay.value || state.currentDay),
    notes: elements.terrainChangeNotes.value.trim(),
  };
  if (selectedDetail && selectedDetail.kind === "terrainChange") {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掗惄顖氼潖閾忓湱纾兼俊顖氭惈椤酣姊虹粙璺ㄦ槀闁稿﹥绻傞悾鐑藉箣閻橆偄浜鹃柨婵嗛閺嬬喖鏌ｉ幘璺烘瀾濞ｅ洤锕、娑樷攽閸℃鍎繝鐢靛Л閸嬫挸霉閻樺樊鍎愰柣鎾冲暟閹茬顭ㄩ崼婵堫槯濠电偞鍨剁喊宥夘敃閼恒儲鍙忔慨妤€妫楁晶濠氭煕閵堝棙绀嬮柡宀€鍠撶槐鎺楀閻樺磭浜俊鐐€ら崑鍕箠濮椻偓瀵鏁愰崪浣瑰缓闂侀€炲苯澧い顓炴穿椤﹀綊鏌ｅ☉鍗炴珝鐎规洖銈搁幃銏ゆ惞閸︻厽顫屽┑鐘垫暩閸嬫盯鎮ч崱娑欏€舵繝闈涱儏閸戠娀鏌ｉ弬鍨倯闁绘挶鍎甸弻锟犲炊椤垶鐣峰┑鐐叉噹閿曪箓鍩€椤掑喚娼愭繛鎻掔箻瀹曞綊鎼归崷顓犵効闂佸湱鍎ら弻锟犲磻閹剧粯鏅查幖瀛樏禍鐐亜閹惧崬濮傛俊缁㈠枤缁辨帞绱掑Ο鑲╃杽濠碘槅鍋勯崯顐﹀煡婢跺ň鏋庢俊顖涙た濡捇姊婚崒娆愮グ闁靛棌鍋撻梺绋款儐閹告悂婀侀梺缁樏Ο濠囧磿閹扮増鐓冮梺鍨儐椤ュ牓鏌＄仦鍓ф创濠碉紕鍏橀、娆撴偂鎼搭喗浜ら梻鍌欑閹碱偆鈧哎鍔戝畷鏇㈡偨缁嬭儻鎽曢梺鐐藉劚绾绢參寮抽妶鍡愪簻闁哄啫娲らˉ宥夋倵濮樺崬顣肩紒缁樼洴瀹曞ジ顢曢～顓炴瀳婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡鍔﹂悡鍫澪ｉ柆宥嗏拻濞达絽鎲￠崯鐐烘嫅闁秵鐓欐い鏃傚帶閳ь剚鎮傞幃楣冩倻閽樺顓洪梺鎸庢磵閸嬫挾绱掗悩鍝勫惞缂佽鲸鎸婚幏鍛存嚃閳╁啫鐏ラ柍璇茬Т椤劑宕奸悢鍝勫箥闂備胶绮幐绋棵归悜钘夌闁绘鏁哥壕濂告偣閸ャ劌绲绘い蹇ｅ弮閺岀喖鎼归顐ｇ杹閻庤娲﹂崑濠傜暦閻旂厧惟闁挎棁濮ゅ鎴︽⒒閸屾瑨鍏岄柛瀣ㄥ姂瀹曟洟鏌嗗鍛焾闁荤姵浜介崝搴∥涢婊勫枑闁哄啫鐗嗛拑鐔哥箾閹存瑥鐏╃紒顐㈢Ч閺屽秷顧侀柛鎾跺枛楠炲啴鎮滈挊澹┿劑鏌嶉崫鍕靛剳缂佸绻樺Λ鍛搭敃閵忊€愁槱濠电偛寮剁划搴㈢珶閺囥垹绀傞梻鍌氼嚟缁犳艾顪冮妶鍡欏缂佽鍊圭粋宥堛亹閹烘挾鍘甸梺鎯ф禋閸嬪棛绮婚悙瀛樺弿濠电姴鍟妵婵嬫煛鐏炶姤鍤囬柟顔界懇閹崇姷鎹勬笟顖欑磾婵犵數濮幏鍐沪閼恒儳浜堕梻渚€娼уú銈団偓姘嵆閵嗕礁顫滈埀顒勫箖濞嗘垟鍋撻悽鐢点€婇柡浣哥У娣囧﹪鎮欓鍕ㄥ亾瑜忕划濠氬箳閹存梹鐏冨┑鐐村灍閹冲洭鍩€椤掑﹦鐣甸柟铏殜椤㈡盯鏁愰崰閭︿簽缁辨捇宕掑▎鎰偘濡炪倖娉﹂崶銊ヤ罕闂佺硶鍓濋崘鑽ょ礊閺嶎厾鍙撻柛銉ｅ妽婵吋绻涘顔绘喚闁轰礁鍊块弻娑㈠即閵娿倗鏁栭梺缁樺姇閿曨亜顫忕紒妯诲闁告稑锕ら弳鍫濃攽閻愰鍤嬬紒鐘虫尭閻ｅ嘲顭ㄩ崘锝嗙€婚棅顐㈡搐閿曘儵鎮楀ú顏呪拺闂傚牊绋撴晶鏇熴亜閿斿灝宓嗛柛鈺傜洴楠炲鏁傞悾灞藉箺闂備胶鎳撻悺銊ヮ潖閻熸壋鏋嶉柛鈩冾焽缁犻箖鏌涘☉鍗炴灍鐎规洖鐭傞弻锛勪沪閸撗勫垱婵犵鍓濋幃鍌涗繆閻ゎ垼妲婚梺缁樻尵閸犳牕顫忛搹鍦＜婵☆垰婀辩换渚€姊洪崫銉バｇ紒瀣尵閸掓帞鎷犲ù瀣潔濠碘槅鍨堕弨閬嶏綖瀹ュ應鏀介柍钘夋閻忥綁鏌嶅畡鎵ⅵ鐎规洏鍎靛畷銊р偓娑櫱氶幏缁樼箾鏉堝墽鎮奸柟铏崌椤㈡艾顭ㄩ崟顏嗙畾濡炪倖鍔х槐鏇⑺囬敃鍌涙嚉闁绘劗鍎ら悡鏇㈡煛閸ャ儱濡煎褏澧楅妵鍕煛娴ｅ摜楠囩紓浣虹帛缁诲啰鎹㈠┑瀣＜婵犲﹤鍠氶弶鎼佹⒒娴ｈ櫣甯涢柟鎼佺畺瀹曚即寮介鐔蜂簵濡炪倖鍔х粻鎴︽倷婵犲洦鐓忓┑鐘茬箳閻ｉ亶鏌￠崱姗嗘畼缂佽鲸鎸婚幏鍛村传閸曠鍋撻幘鍓佺＝鐎广儱瀚粣鏃傗偓娈垮枛椤兘寮幇顓炵窞濠电姴瀚烽崬娲⒒娴ｈ櫣甯涢柛鏃€顨婂顐﹀箹娴ｅ憡杈堥梺闈涚墕椤︿即宕愰崹顐ょ闁割偅绻勬禒銏＄箾閸涱噯鑰块柡灞剧洴楠炴鎹勯悜妯间邯闁诲氦顫夊ú妯侯渻娴犲鏄ラ柍褜鍓氶妵鍕箳瀹ュ顎栨繛瀛樼矋缁捇寮婚悢鍏煎€绘俊顖濇娴犳潙顪冮妶鍛濞存粠浜璇差吋婢跺鍙嗛柣搴秵娴滅偤鎮烽妸鈺傗拻闁搞儜灞锯枅闂佸搫琚崝宀勫煘閹达箑骞㈡繛鍡楁禋閺夊憡淇婇悙顏勨偓鏇犳崲閹烘挾绠鹃柍褜鍓熼弻鐔碱敊閼姐倗鐓撳銈冨灪缁嬫垿鍩ユ径濠庢僵妞ゆ挾鍋涢悘锟犳⒒閸屾瑧顦﹂柟纰卞亞閹噣顢曢敃鈧粈澶屸偓鍏夊亾闁告洖澧庣粙蹇撯攽閻樼粯娑фい鎴濇噽缁濡烽妷鍐ㄧ秺閺佹劖寰勭€ｎ偆褰稿┑鐘灱椤煤閺嶎厼鐓橀柟杈鹃檮閸婄兘鏌ょ喊鍗炲妞わ絾妞藉铏规嫚閼碱剛顔夌紓浣筋嚙閻楀棝顢氶敐鍥╃煓閹煎瓨鎸婚～宥夋⒑闂堟盯鐛滅紒杈ㄦ礋瀹曘垺绂掔€ｎ偀鎷洪梺鍛婄箓鐎氼垶鎯傛担璇ュ綊鏁愭径瀣彸闂佸憡甯楃敮鈥愁潖缂佹ɑ濯撮柧蹇曟嚀缁椻剝绻涢幘瀵割暡妞ゃ劌锕ら悾鐑藉箮閼恒儲娅滈梺鍛婄矆缁€浣糕枔閵婏妇绠鹃悗鐢殿焾瀛濆銈嗗灦閸旀瑥顕ｉ锕€鐐婃い鎺嶈兌閸樹粙姊鸿ぐ鎺戜喊闁哥姵顨婂鎶藉煛閸涱喚鍘告繝銏ｆ硾椤戝棝宕愰幇顓熷弿濠电姴瀚敮娑㈡煙瀹勭増鍤囬柟鐓庣秺閹兘骞嶉鍛还婵犵绱曢崑鎴﹀磹閹达箑绀夌€光偓閸曨偆鐤囧┑顔姐仜閸嬫挻顨ラ悙鎻掓殺妞わ箑澧庣槐鎺楁偐瀹曞洠妲堥梺瀹犳椤︻垵鐏掗梺鍛婄箓鐎氼亪骞夋ィ鍐┾拻闁稿本鐟ч崝宥夋煟椤忓嫮绉虹€规洜顢婇妵鎰板箳閹寸姷鏋€闂備浇娉曢崰鎾存叏閹绢喗鍋傞柡鍥ュ灪閻撴瑩寮堕崼銉х暫婵＄虎鍣ｉ弻锝夊箻鐠虹洅銏ゆ煃鐟欏嫬鐏存い銏＄懇閹稿﹥寰勬繝搴㈢秼闂傚倷绶氶埀顒傚仜閼活垱鏅堕娑氱闁肩⒈鍓欓弸搴亜閺囶亞绉鐐寸墬閹峰懘宕妷顔兼倛濠电姷鏁告慨鎾倶濮樿泛绀夋俊銈呮噹閼稿綊鏌ｉ姀鐘冲暈闁抽攱鍨块弻銈嗘叏閹邦兘鍋撻弴銏犲嚑闁哄倹顑欓悢鍡欐喐鎼淬劊鈧啯绻濋崨顕嗙磽闂傚倷绶氬褏鎹㈤崱娑樼疇闁搞儺鍓欑壕濠氭煙閹规劕鐓愰柛鐘叉閺屾盯寮撮妸銉ヮ潾濡炪倧璐熼崝宀勫煘閹达附鏅柛鏇ㄥ亗缁呯磽娓氬洤鏋熼柣鐔村劦椤㈡岸鏁愭径妯绘櫇闂佹寧娲嶉崑鎾剁磼閻樺磭鈯曢柕鍥у楠炴鎹勬潪鐗堝煕缂傚倷鐒﹂崝妤呭磻閵堝钃熼柨婵嗘閸庣喐銇勯弽銊х煂閺嶏繝姊绘担鍛婂暈闁圭顭烽幃鐑藉煛閸涱喖浠掑銈嗘磵閸嬫挻顨ラ悙鍙夊枠闁诡啫鍥ч唶婵﹩鍘奸褰掓⒒娴ｈ棄鍚瑰┑顔芥綑鐓ら柍鍝勫暕閻掑﹥绻涢崱妯虹仼濞戞挸绉归弻鐔煎箚閺夊晝鎾绘煟閹惧瓨绀嬮柟顔筋殜閺佹劖鎯旈垾鎰佹交闂備礁鎼鍡涙儎椤栫偛钃熺€广儱顦敮濡炪倖鐗楃划搴ㄥ汲閵堝鍊甸悷娆忓缁€鈧梺闈涚墛閹倿鐛崘顔碱潊闁靛牆鎳庣粣娑欑節閻㈤潧孝閻庢凹鍓氱换娑㈠炊椤掍讲鎷婚梺绋挎湰閻燂妇绮婃导瀛樼厱閻庯綆鍋勬慨宥夋煕閳哄倻娲寸€规洖銈告俊鐑藉Ψ瑜滃Σ顖涚節濞堝灝鏋熼柕鍥ㄧ洴瀹曟垿骞橀崹娑樹壕閻熸瑥瀚粈鍐煕閵娿儲鍋ラ柣娑卞枛铻ｉ柛蹇曞帶閻濅即姊洪崷顓犲笡閻㈩垳鍋ら崺鈧い鎺戭槸楠炴牗銇勯鍕殻濠碘€崇埣瀹曞崬螖閳ь剝銆栫紓鍌氬€烽悞锕併亹閸愵煈鐒介柍銉ョ－閺嗭附绻涢崱妯诲鞍闁哄懏鎮傞弻锝呂熼搹鐧哥礊闂佸憡眉缁瑩寮婚悢鐓庣闁兼祴鏅滃▓顒勬⒑閹肩偛濡肩紓宥咃工閻ｇ兘鎮介崜鍙夋櫌闂佸憡娲﹂崜娑㈠储閸楃偐鏀介柣鎰级椤ユ粎绱掔紒妯哄鐎殿喗濞婇弫鎰緞鐎ｎ剙骞楁繝鐢靛仦閸ㄩ潧鐣烽鈧埢宥咁吋閸ワ絽浜鹃悷娆忓缁€鈧悗瑙勬处閸撶喖宕洪妷锕€绶炲┑鐐灮閸犳牠骞婇弽顓炵厸闁稿本绮庤ⅵ闂傚倸鍊搁崐鎼佸磹妞嬪海鐭嗗ù锝呮贡閻濊泛鈹戦悩鍙夋悙缁炬儳顭烽弻娑樷槈閸楃偟浠悗瑙勬礃閻擄繝寮诲☉銏犲嵆闁靛鍎遍～鈺侇渻閵堝棙绀嬪ù婊冪埣楠炲啫螖閸涱喗娅滈柟鑲╄ˉ閸撴繈鎮樺澶嬧拺闁规儼濮ら弫閬嶆煕閵娿儲鍋ョ€殿喛顕ч埥澶娢熼柨瀣垫綌婵犳鍠楅〃鍛存偋閸℃ê顕遍柟閭﹀幘缁♀偓濠电偛鐗嗛悘婵嬪几濞戙垺鐓熸俊銈勭劍瀹曞瞼鈧鍠栭…鐑藉极閹邦厼绶為悗锝庡亝閻濇娊姊虹涵鍛汗閻炴稏鍎甸崺鈧い鎺嶇缁插鏌＄€ｎ亞澧曢柍瑙勫灴閹晛鈻撻幐搴㈩唶缂傚倷娴囨ご绋棵洪悢椋庢殾婵°倐鍋撴い顐ｇ矒閸┾偓妞ゆ巻鍋撻柣锝呭槻鐓ゆい蹇撴噺濞呫垽姊虹紒姗嗙劸閻忓繑鐟╅弫宥咁煥閸愶絾鏂€闁圭儤濞婂畷鎰板箻閸撲胶鐒兼繛鎾村焹閸嬫挻銇勯姀鈩冾棃闁诡喗绮岃灒闁兼祴鏅濆Σ鍥⒒娴ｅ湱婀介柛銊ㄦ椤洩顦崇紒鍌涘浮閸╋繝宕ㄩ鎯у箥婵犵數鍋犵亸顏堫敊婵犲嫯濮抽柣锝呯灱绾惧ジ寮堕崼姘珔濞寸娀浜堕弻娑㈠煘閹傚濠碉紕鍋戦崐鏍暜婵犲洦鍤勯柛鎾茶兌娑撳秴螖閿濆懎鏆為柣鎾存礃缁绘繃绻濋崒姘闂佸搫妫涢崰鎾舵閹烘挸绶炴俊顖滃劋閻忓牓姊虹€圭媭娼愰柛銊ユ健瀹曞綊骞嗚閺嗭箓鏌涢妷锝呭闁哥姵鐗滅槐鎾诲磼濞嗘帒鍘＄紓渚囧櫘閸ㄦ娊骞戦姀銈呴唶婵犻潧鐗婂▓楣冩⒑閸撴彃浜濇繛鍙夌墬閸庮偊鏌ｉ悢鍝ョ煀缂佸缍婇幃浼搭敋閳ь剟鐛崶顒佸亱闁割偅纰嶇€氳棄鈹戦悙鑸靛涧缂佽弓绮欓獮澶愭晸閻樿尙鏌堥梺缁樺姇閻即鍩€椤掍礁绗掓い顐ｇ箞椤㈡顦抽柣銈勭窔閹鎲撮崟顒傤槰濠电姰鍨洪敃銏ゆ晲閻愭祴鏀介悗锝呯仛閺呯偤姊虹紒妯哄闁宦板姂婵￠潧鈹戦崶鑸殿啍闂佺粯鍔橀幓顏堟嚀閹稿簺浜滈柕蹇ョ磿閹冲洭鏌熼鐓庘挃濞寸媴绠撻幐濠冨緞瀹€濠傛倯婵犵數濮烽。顔炬閺囥垹纾婚柟杈剧畱绾惧綊鏌″搴″箺闁稿顑嗘穱濠囧Χ閸屾矮澹曟俊鐐€ら崑鍛崲閸喍绻嗛柟闂寸閻撴盯鏌涚仦鎯х劰闁稿鎹囧畷绋课旀担鍝勫箞婵犵數濞€濞佳呪偓姘煎墴瀹曟繂螖閸涱喚鍘遍柣搴秵閸嬪懐浜搁悽鍛婄厵闁告瑥顦扮亸锔锯偓瑙勬礈閸犳牠銆佸Δ鍛＜闁靛牆鏌婇悙鐑樷拻濞达絽婀卞﹢浠嬫煕閳轰礁顏€规洖缍婇幃鍓т沪閹冪哎婵犵數濞€濞佳囶敄閸パ呮殼濞撴埃鍋撻柡灞剧洴楠炲洭鍩℃担鑲濄劑姊洪崫鍕靛剰闂佸府缍佸濠氭偄閸忕厧鈧攱銇勯幒宥堝厡缂佸娲ら埞鎴︽倷閼碱剙顣堕梺绋匡攻缁诲倿锝炶箛鎾佹椽顢旈崨顓熺暟闂備礁鍟块幖顐︽晝閿曞倸绀夐柟闂寸劍閳锋垿鎮归崶顏勭毢缂佺姾灏欓埀顒€鍘滈崑鎾剁磼鐎ｎ厽纭堕柡鍡檮閵囧嫰寮介顫捕婵炵鍋愭繛鈧柡灞剧洴瀵潙螣閸濆嫷鐎撮梻浣告惈閸婄敻宕戦幘缁樷拻闁稿本鐟ㄩ崗宀€绱掗鍛仸闁轰礁顑夊铏规嫚閼碱剛顔夐悗鍏夊亾缂佸顑欓崵鏇㈡煙閹増顥夐柣鎾寸洴閺屾稑鈽夐崡鐐寸亾闂佸憡锕㈡禍鍫曞蓟閿濆棙鍎熸い鏍ㄧ矌鏍￠梻浣告啞閹稿鎮烽敂鍓х焿闁圭儤鎸荤紞鍥煃鐟欏嫬鍔ゅù婊堢畺閹嘲鈻庤箛鎿冧痪缂備讲鍋撻柍褜鍓涚槐鎾诲磼濮樻瘷銏ゆ煥閺囥劋閭柟顔诲嵆椤㈡岸鍩€椤掆偓閻ｇ兘宕￠悙鈺傤潔濠碘槅鍨伴妶鎼佹偘閹剧粯鈷戦柤濮愬€曟牎婵炲瓨绮堢划娆忕暦濠靛洦鍎熼柕濞垮劤閸樻椽姊洪崫鍕偍闁搞劍妞介崺娑㈠箳濡や胶鍘遍柣蹇曞仦瀹曟ɑ绔熷鈧弻宥堫檨闁告挾鍠栬棢闁规崘娉涢崹婵嬫煕椤愩倕鏋旈柣鐔风秺閺屽秷顧侀柛鎾跺枛閹即顢氶埀顒€顕ｆ禒瀣垫晣鐟滃酣寮插┑瀣拺闁圭瀛╅埛鎺旂磼椤曞懎鐏︾€殿喗鐓￠幃娆撴倻濡攱瀚奸梻浣告啞缁嬫垿鏁冮敃鍌氱叀濠㈣埖鍔栭悡鐔煎箳閹惰棄绀夐柟杈剧畱缁犳牠鏌ㄩ悢鍝勑㈤柣鎺戠仛閵囧嫰骞掗幋婵愪痪闂佹娊鏀遍崹鍧楀蓟閻旇櫣鐭欓柟绋垮瀹曞磭绱撴担鍝勑ｉ柟绋款煼婵＄敻宕熼娑欐珕闁荤姴娲╃亸娆愮閹间焦鈷戠憸鐗堝笚閺侀亶鏌涢妸銉﹀仴妤犵偛鍟存慨鈧柕鍫濇噽椤ρ囨⒑閸忚偐銈撮柡鍛洴閻涱喖螖閸涱喒鎷绘繛杈剧到閹诧繝骞嗛崼銉︾厱闁绘洑绀佹禍鎵偓瑙勬礃閸旀瑩骞冮悾宀€鐭欓悹渚厛閸炵敻姊绘担鑺ョ《闁哥姵鎸婚幈銊╂偨閸涘﹤浜楀┑鐐村灦閳笺倛銇愰幒鎾存珳闂佸憡渚楅崰妤呭窗閹扮増鐓涚€广儱绻掔壕璺ㄧ磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹闂傚倷鑳堕崕鐢稿疾閳哄懎鍨傞柛顐ｆ礃閸嬫ɑ銇勯弮鍫熸殰闁稿鎹囬弫鎰償閳╁啰浜堕梻浣侯焾閿曘倝鈥﹂悜钘夎摕婵炴垯鍨瑰敮濡炪倖鐗楅崙鐟懊洪銏＄厸濠㈣泛妫欏▍鍡樹繆椤愩垹鏆欐い顐㈢箳缁辨帒螣鐠囧樊鈧捇鏌ｉ悢鍝ユ噧閻庢凹鍓氱粋鎺楀煛閸涱喒鎷虹紓浣割儏鐏忓懘寮ㄧ紒妯肩闁肩⒈鍓欓弸娑㈡煏閸℃洜绐旂€殿喕绮欐俊鎼佸Ψ瑜忛悰顔尖攽閻樺灚鏆╁┑顔碱嚟閳ь剚绋堥弲婵堟閻愬瓨鍎熼柍閿亾闁衡偓娴犲鐓熼柟閭﹀墮缁狙囨煃缂佹ɑ绀€闂囧绻濇繝鍌氼伀闁活厼鐬肩槐鎺楊敊閼恒儺娼￠梺闈涙处閸旀瑩鐛幒妤€绠婚悹鍝勬惈缁犳椽姊婚崒娆戭槮缂傚秴锕畷鎴炵節閸パ冨亶闂佸吋绁撮弲娑氭閵堝洨纾藉ù锝夘€囧鍕洸婵犲﹤瀚ㄦ禍婊堟煙閸濆嫭顥滃ù婊勫劤椤啴濡堕崱妤冧淮濡炪倧瀵岄崹鍫曟晲閻愬墎鐤€婵炴垶鐟ラ埀顒傜帛娣囧﹪顢涘┑鎰濡炪値鍋撶换婵嗩潖閾忚鍠嗛柛鏇㈡涧閺呴亶姊洪崫銉バｉ柣妤侇殕缁岃鲸绻濋崘顏嶆祫闁诲函缍嗛崑鈧柟閿嬫そ閺岋綁鎮╅崣澶岊槺闂侀€炲苯澧叉繛鍛礋閹﹢宕奸妷锔规嫼缂備礁顑呯亸鍛村绩婵犳碍鐓欐い鏃傚帶閳ь剙娼￠悰?${selectedDetail.id}`,
      () => adapter.updateTerrainChangeSet(selectedDetail.id, payload),
      selectedDetail,
    );
  } else {
    await runAction(
      `闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ょ紓宥咃躬瀵鎮㈤崗灏栨嫽闁诲酣娼ф竟濠偽ｉ鍓х＜闁绘劦鍓欓崝銈囩磽瀹ュ拑韬€殿喖顭烽幃銏ゅ礂鐏忔牗瀚介梺璇查叄濞佳勭珶婵犲伣锝夘敊閸撗咃紲闂佺粯鍔﹂崜娆撳礉閵堝洨纾界€广儱鎷戦煬顒傗偓娈垮枛椤兘骞冮姀銈呯閻忓繑鐗楃€氫粙姊虹拠鏌ュ弰婵炰匠鍕彾濠电姴浼ｉ敐澶樻晩闁告挆鍜冪床闂備浇顕栭崹搴ㄥ礃閿濆棗鐦遍梻鍌欒兌椤㈠﹤鈻嶉弴銏犵闁搞儺鍓欓悘鎶芥煛閸愩劎澧曠紒鈧崘鈹夸簻闊洤娴烽ˇ锕€霉濠婂牏鐣洪柡灞诲妼閳规垿宕卞▎蹇撴瘓缂傚倷闄嶉崝宀勫Χ閹间礁钃熼柣鏂垮悑閸庡矂鏌涘┑鍕姢鐞氾箓姊绘担鍛婃儓闁活厼顦辩槐鐐寸瑹閳ь剟濡存担鍓叉建闁逞屽墴楠炲啫鈻庨幘宕囶啇濡炪倖鎸鹃崳銉ノ涜濮婂宕掑▎鎴犵崲濠电偘鍖犻崗鐐☉閳诲酣骞嬮悙瀛橆唶闂備礁婀遍崕銈夈€冮幇顔剧闁哄秲鍔庣弧鈧梻鍌氱墛娓氭宕曢幇鐗堢厸闁告侗鍠氶崣鈧梺鍝勬湰缁嬫垿鍩ユ径鎰闁绘劕妯婂缁樹繆閻愵亜鈧垿宕曢弻銉﹀殞濡わ絽鍟悡姗€鏌熺€电浠滅紒鐘靛█濮婅櫣绮欓崠鈩冩暰濡炪們鍔屽Λ婵嬬嵁閸儱惟闁冲搫鍊搁埀顒€顭烽弻锕€螣娓氼垱楔闂佹寧绋掔粙鎴﹀煘閹达附鍊烽柡澶嬪灩娴滃爼姊洪悷鎵紞闁稿鍊曢悾鐑藉醇閺囥劍鏅㈡繛杈剧秮閺呰尙绱撻幘鍓佺＝闁稿本鐟чˇ锔姐亜閹存繃顥犻柍褜鍓涢悷鎶藉炊閵娿儮鍋撻崹顐犱簻闁圭儤鍨甸顏堟煕婵犲倻浠涙い銊ｅ劦閹瑩鎳犻鑳闂備礁鎲″鍦枈瀹ュ桅闁告洦鍨遍弲婊堟偣閸ヮ亜鐨哄ù鐙€鍨崇槐鎾寸瑹閸パ勭亪闂佺粯顨呯换姗€宕洪埀顒併亜閹烘埊鍔熺紒澶屾暬閺屾稓鈧絺鏅濋崝宥囩磼閸屾氨孝妞ゎ厹鍔戝畷濂告偄閸濆嫬绠ラ梻鍌欑閹诧紕鎹㈤崒婧惧亾濮樼厧鏋﹂柛濠冩尦濮婄粯鎷呴崨濠傛殘闂佸搫琚崝搴ｅ垝閺冨牊鍋ㄧ紒瀣嚦閿曞倹鐓曢柡鍥ュ妼閻忕姵淇婇锝忚€块柡宀€鍠撶划娆撳锤濡ゅň鍋撳Δ浣典簻闁挎棁顫夊▍鍥╃磼鏉堛劍灏伴柟宄版嚇閹煎綊鎮烽幍顕呭仹缂傚倸鍊峰ù鍥敋瑜斿畷鎰板锤濡炲皷鍋撴担鍓叉僵閻犺桨缍嶉妸鈺傜厓闁告繂瀚埀顒€顭峰畷锝夊幢濞戞瑧鍘介柟鍏兼儗閸ㄥ磭绮旈悽鍛婄厱閻庯綆浜濋ˉ銏⑩偓瑙勬礃閻熲晠寮幘缁樺亹闁哄倶鍎茬€氬ジ姊婚崒娆戣窗闁稿妫濆畷鎴濃槈閵忊€虫濡炪倖鐗楃粙鎺戔枍閻樼偨浜滈柡宥冨妿閵嗘帞绱掗悩鑽ょ暫闁哄被鍊楅崰濠囧础閻愬樊娼婚梻浣告惈椤戝懘鏌婇敐澶婅摕闁挎繂顦伴弲鏌ユ煕閵夋垵鍟粻锝嗕繆閻愵亜鈧垿宕归搹鍦煓闁硅揪绠戦悡鈥愁熆鐠轰警鐓繛绗哄姂閺屾盯鍩勯崘鐐暦濡炪倖姊归幑鍥ь潖缂佹ɑ濯寸紒娑橆儏濞堫參鏌ｆ惔銏⑩枔闁哄懏绻勯崚鎺戔枎閹惧磭顔婂┑掳鍊撻悞锕€鈻嶉弮鍫熲拻闁稿本鐟чˇ锕傛煙鐠囇呯瘈妤犵偞鍔栭妶锝夊礃閵娧呮瀮闂備浇顫夊畷姗€顢氳閹€愁潨閳ь剟寮婚悢鍛婄秶濡わ絽鍟宥夋⒑缁嬪尅鍔熼柛蹇旓耿瀵鈽夊Ο閿嬬€婚棅顐㈡祫缁查箖鍩㈤幘鏂ユ斀闁宠棄妫楁禍鍓х磼缂佹绠撴い顐㈢箰鐓ゆい蹇撳瀹撳秴顪冮妶鍡樺瘷闁告侗鍘兼瓏婵犵绱曢崑鎴﹀磹閵堝鍌ㄥΔ锝呭暙缁€鍌涙叏濡炶浜鹃梺缁樹緱閸ｏ絽鐣峰鈧、娆撴嚃閳衡偓缁辨粓姊绘担鍛婃儓闁稿﹤鐖煎畷鏇㈠蓟閵夛箑鈧潧鈹戦悩宕囶暡闁抽攱鍨块弻娑㈡晜鐠囨彃绠规繛瀛樼矌閸嬫挾鎹㈠☉銏犵闁兼祴鏅滈崳浼存⒑缁洘鏉归柛瀣尭椤啴濡堕崱妤冪懆闂佺锕ょ紞濠傤嚕閹剁瓔鏁嗛柛鏇ㄥ墰閸樻悂鎮楅崗澶婁壕闁诲函缍嗛崜娑溾叺婵犵數濮甸鏍窗閹烘纾婚柟鍓х帛閳锋垿鎮楅崷顓炐ｆい銉ヮ槹娣囧﹪顢曢敐搴㈢杹閻庢鍠楅悡锟犲蓟閸℃鍚嬮柛鈥崇箲鐎氳偐绱撻崒姘偓鐑芥倿閿曞倹鏅繝鐢靛仦閹矂宕板杈潟闁圭儤顨嗛崑鎰偓瑙勬礀濞层倝鍩呰ぐ鎺撯拺濞村吋鐟ч幃濂告煕韫囨棑鑰块柕鍡曠閳藉濮€閳ユ枼鍋撻悜鑺ヮ棅妞ゆ劦鍋勯獮姗€鏌ｉ幇顒婅含婵﹦绮粭鐔煎焵椤掆偓椤洩顦归柡浣哥Х缁犳稑鈽夊Ο姹囦虎闂備礁鎲￠崝锔界濠婂懓濮抽柕澶嗘櫆閳锋帡鏌涚仦鎹愬闁逞屽墮閸㈡煡婀侀梺鎼炲労閸擄箓寮€ｎ喗鐓涚€广儱楠搁獮鏍煕閵娿儱鈧潡鐛弽顬ュ酣顢楅埀顒佷繆閼测晝纾奸柍褜鍓熷畷姗€鍩炴径鍝ョ泿闂傚鍋勫ú锕傚箰婵犳澶愬箣閻愭壆绠氬銈嗗姉婵瓨淇婄捄銊х＜閺夊牄鍔嶅畷宀€鈧娲樼敮鎺楋綖濠靛鏁勯柦妯侯槷婢规洘淇婇悙宸剰閻庢稈鏅犻、鏇熺鐎ｎ偆鍙嗛梺缁樻煥閹碱偄鐡紓鍌欑劍閸旀牠銆冮崱妯尖攳濠电姴娲ゅ洿闂佸憡渚楅崰鏍р枍閵堝鈷戠紒瀣儥閸庢粎绱掔紒妯肩疄鐎殿喛顕ч濂稿幢濡警娼梻浣筋潐椤旀牠宕板☉姘辩幓婵°倕鎳忛埛鎴︽煙閼测晛浠滈柍褜鍓氶悧鏇犲弲闂佸搫绋侀崢濂告偂濮椻偓閺岀喐娼忔ィ鍐╊€嶉梺绋款儐閸旀鍩€椤掑喚娼愭繛鍙夌墪闇夐柛宀€鍋涘Ч鏌ユ煥閻斿搫校闁抽攱鍨圭槐鎺斺偓锝庡亽閸庛儵鏌涙惔锛勭闁诡喗顨呴～婵嬵敃閵忕姷銈柣搴㈩問閸犳牠鈥﹂悜钘夋瀬闁归偊鍘肩欢鐐测攽閻樻彃顏撮柛鐔奉儔濮婄粯鎷呴悷鏉垮Б濠电偛鐡ㄥ畝绋跨暦閹达箑宸濇い鎾跺У濞堥箖姊洪崨濠傚婵☆垰锕ら妴鎺撶節濮橆厾鍘梺鍓插亝缁诲啴藟閻愮儤鐓熼柟鎯у船閸旀粓鏌曢崶褍顏柡浣稿暣瀹曟帒鈽夊▎鎾存殬濠碉紕鍋戦崐銈夊磻閸曨厽宕查柟閭﹀枛瀵弶淇婇悙顏勨偓鏇犳崲閹版澘绠犻柟鐗堟緲缁€澶愭⒒閸喓鈻撻柡鈧禒瀣厽闁归偊鍘界紞鎴︽煟韫囥儳鐣甸柡灞诲妼椤繃娼忛埡鍐跨床濠电偞鎸婚懝鎯洪妶澶婂嚑婵炴垯鍨洪悡鍐偡濞嗗繐顏╅柣蹇旀尦閺岀喖顢欓悾灞惧櫚閻庢鍠栭悥鐓庣暦瑜版帩鏁婇柣鎰靛墻閸熲偓闂傚倸鍊搁崐椋庣矆娓氣偓楠炲鏁撻悩鑼槷閻熸粌绻愰銉︾節閸愶箑浜濋梺鍛婂姀閺呮盯鍩€椤掑啯纭鹃棁澶愭煥濠靛棙鍣规い銉ョ箲缁绘盯骞橀幇浣哄悑闂佸搫鏈ú鐔风暦閻撳簶鏀介柛銉ㄥ煐閿涗線姊虹拠鑼婵炲瓨纰嶇粋宥夘敂閸繆鎽曞┑鐐村灟閸ㄨ鍎梻浣瑰閺屻劑锝為弴鐔侯浄闁靛繈鍊栭埛鎴犵磼椤栨稒绀冩繛鍛閺岋綁鍩℃繝鍌滀桓闂佺粯渚楅崰姘跺焵椤掑﹦绉甸柛鐘愁殜瀵彃顭ㄩ崼鐔哄幗闂佹寧绻傞幊鎾垛偓姘卞椤ㄣ儵鎮欓懠顒€鈪靛┑顔硷功缁垶骞忛崨瀛樺仭闂侇叏绠戝▓婵囩節绾版ɑ顫婇柛瀣€诲▎銏狀潩闊祴鍋撴担鍓叉僵闁归鐒﹂埢宀勬⒒娴ｈ櫣甯涘〒姘殜瀹曚即寮介鍌欑胺闂傚倷绀侀幉鈩冪瑹濡ゅ懎绐楁慨妯挎硾閸屻劑姊洪鈧粔鐢稿煕閹达附鈷掗柛顐ゅ枔閵嗘帒顭胯濞茬喖寮诲☉娆戠瘈闁稿本绋戦弳鍫㈢磽娴ｇ鈧摜绮旈悽绋课ч柨婵嗩槸缁€鍐煃閸︻厼浜鹃悗姘矙濮婄粯鎷呮笟顖滃姼闂佸搫鐗滈崜鐔煎箖閻戣棄惟闁宠桨鑳堕ˇ褔鎮楅崗澶婁壕闂侀€炲苯澧版俊鍙夊姍楠炴帒螖婵犲啯娅旈梻浣告啞娓氭宕㈤悙顒傤浄闁归棿鐒﹂埛鎴︽偣閸ワ絺鍋撻搹顐ｎ唲闂備焦鎮堕崕婊堝礃閵娧佸仏闂傚倸鍊风欢姘焽瑜忛幑銏ゅ箳閹炬潙寮块梺鍓插亾缂嶅棗危閸撗呯＝濞达絼绮欓崫娲偨椤栨粌浠遍柛鈹惧亾濡炪倖甯掗敃锔剧矓閻㈠憡鐓曢悗锝庡亜濞搭喚鈧娲樺ú鐔镐繆閻戣棄鐓涢柛灞剧矊楠炲牓姊绘笟鈧褔鎮ч崱妞㈡稑鈻庨幋鐘电劶闂侀€炲苯澧存慨濠呮閳ь剙婀辨刊顓烆焽閹扮増鐓曢柕濞垮劜閸嬨儲顨ラ悙鎻掓殻闁糕晪绻濆畷姗€鏁愰崨顒€顥氶梻渚€娼荤€靛矂宕㈤悡搴ｆ懃濠碉紕鍋戦崐鎴﹀磿閼碱剚宕查柛顐ｇ箥濞兼牠鏌ц箛鎾磋础缁炬儳鍚嬫穱濠囶敍濠靛浂浠╅梺鑽ゅ枑瑜板啴鍩為幋锔芥櫖闁告洦鍋傜划褏绱撴笟鍥ф灍闁荤喆鍎甸、姘舵晲閸ャ劌鐝板┑鐐存綑椤戝棝锝炲澶嬧拺闂傚牊绋撶粻鍐测攽椤旀儳鍘撮柟顔兼健閸┾偓妞ゆ帒瀚埛鎺懨归敐鍛喐闁哄鍟穱濠傤渻閻撳骸顬嬬紓渚囧枛閻楀﹦绮悢鐓庣劦妞ゆ帒瀚悘鎶芥煛瀹ュ骸浜愰柛瀣崌閺佹劖鎯旈垾鎰佹骄缂備胶鍋撳畷妯何涢崟顖涚畳闂備焦瀵х换鍌毭洪敃鍌氬惞闁逞屽墯缁绘繂鈻撻崹顔界亪濡炪倧濡囬弫璇差嚕鐠囨祴妲堟慨姗堢到娴滈箖鏌ㄥ┑鍡楁殭濠碘€炽偢閺屽秷顧侀柛鎾存皑閹广垽宕掗悜鍡樻櫔闂佹寧绻傚Λ娑氬姬閳ь剙鈹戦鏂や緵闁告ê鍚嬬粋宥咁煥閸啿鎷虹紓浣割儓濞夋洜绮婚幎鑺ョ厱婵☆垳濮撮崯鐘诲几閺冨牊鐓欓柟娈垮枛椤ｅジ鏌嶉柨瀣伌闁哄本鐩獮鍥敆閳ь剛鐥閺岀喖顢涘鍗烆暫闂佸疇顫夐崹鍧椼€佸☉姗嗙叆闁告侗鍘鹃濂告煟鎼达紕浠涙繝銏☆焽閳ь剚鐭崡鎶芥偘椤曗偓瀹曞爼顢楁径瀣珝闂備胶绮摫鐟滄澘鍟扮划顓烆潩閼哥鎷洪梺鐓庮潟閸婃洟寮搁幋鐘电＜妞ゆ棁鍋愯倴闂佸憡甯楃敮锟犵嵁濡櫣鏆﹂柛銉ｅ妽椤旀洘绻濋悽闈浶㈤柨鏇樺€濆畷顖炴偐鐠囨彃鍤戦柟鍏肩暘閸斿秹鎮″▎鎾寸厵妞ゆ牕妫楅幏鎴犳閻愮儤鈷戦柛婵嗗鐎氫即鏌ｅΔ浣瑰碍妞ゎ偄绻愮叅妞ゅ繐瀚ˇ顓㈡⒑閼测斁鎷￠柛鎾寸懅閺侇噣濡烽埡鍌楁嫼闂佸憡绺块崕杈ㄧ墡婵＄偑鍊戦崝宀勫箠閹炬眹鈧倹銈ｉ崘鈹炬嫼闂佸憡绋戦敃銉﹀緞閸曨垱鐓曢柕濞炬櫃閹查箖鏌涢埡鍌滄创妤犵偞甯掕灃濞达絽鎼獮鍫ユ⒑鐠囪尙绠抽柛瀣仜閻ｅ嘲螣閼姐倗褰惧┑顔姐仜閸嬫捇鏌＄仦鐣屝ユい褌绶氶弻娑㈠箻閺夋垵鎽靛Δ鐘靛仜閸熸潙鐣烽幒鎴僵閺夊牄鍔嶉鏇㈡⒒娴ｇ瓔娼愬鐟版閺呰泛螖閸涱厾锛欐繝鐢靛У绾板秹鎮￠悩缁樼厵妞ゆ挾鍠庣粭鎺楁煕閺冣偓绾板秶鎹㈠☉銏犻唶闁绘棃顥撴导灞解攽椤旂》鏀绘俊鐐舵閻ｇ兘濡搁敂鍓х槇闂佸憡鍔戦崝搴ㄦ偂椤栫偞鈷掑ù锝堟鐢盯鎮介锝勭敖缂侇喖顭烽獮妯虹暦閸ャ劍顔曟繝寰锋澘鈧劙宕戦幘娣簻妞ゆ挻绮屾慨鍌溾偓瑙勬礀閵堟悂骞冮姀銈呬紶闁告洦鍋嗛悿鍕節绾板纾块柛瀣灴瀹曟劙寮介鐐殿槷閻熸粌绻愰銉︾節閸パ咁槶閻熸粌绻橀幆宀勫幢濞戞瑧鍘撻悷婊勭矒瀹曟粓鎮㈡總澶嬬稁闂佸憡绻傜€氬懓顦圭€规洘鍎奸ˇ顕€鏌涚€ｎ偅灏摶鏍煕濞戝崬骞橀柨娑欑洴濮婅櫣鎲撮崟顐ゎ槰闂佺硶鏅滈悧鏇㈡偩閻戣棄鐭楀璺虹灱椤旀洟姊洪悷鎵憼闁荤喆鍎甸幃姗€鍩￠崘顏嗭紲闂佺粯鐟ラ幊鎰矙閼姐倗纾肩紓浣诡焽濞插鈧娲栧畷顒冪亙闂佸憡鍔︽禍鍫曞船閸濆嫧鏀介柣鎰▕閸ょ喎鈹戦悙鈺佷壕缂傚倷鑳舵慨鐢告偋閺囶澁缍栭煫鍥ㄧ⊕閹偤鏌涢敂璇插箻闁绘挻鎹囧娲礈閼碱剙甯ラ梺闈╃秵閸ｏ絽鐣峰┑鍥х窞濠电姴瀛╃€靛矂姊洪棃娑氬闁哥噥鍋呮穱濠冪附閸涘﹦鍙嗛梺鍝勬储閸斿鑺辩紒妯镐簻闁哄浂浜為幃濂告煙妞嬪骸孝闂囧鎮楅敐搴′航婵炲吋姊圭换婵堝枈濡椿娼戦梺鎼炲妺閸楀啿鐣烽妷褉鍋撻敐搴濈按闁哄妫冮弻锟犲炊閵夈儳浠鹃梺鎶芥敱閸ㄥ灝顫忓ú顏嶆晝闁靛牆鎳嶇划鍫曟⒑閸忓吋銇熼柛銊╀憾瀵煡宕滄担鎻掍壕闁汇垻鏁搁妴濠囨煕鐎ｎ偅灏甸柟鍙夋尦瀹曠喖顢楅崒銈喰為梻鍌欑劍閹爼宕濇惔銊ユ瀬濠电姵鑹鹃弰銉╂煏婢舵稓鐣辩紒鍓佸仱閺岀喖鏌囬敃鈧晶缁樼箾閻撳函韬慨濠冩そ閹瑩鎸婃径濠傤潛缂備礁澧介搹搴ㄥ矗閳ь剟鏌曢崶銊ュ鐎规洏鍔庨埀顒佺⊕鑿ら柟椋庣帛缁绘稒娼忛崜褏袣濠电偛鎷戠徊鍧楀极椤斿皷妲堥柕蹇ョ磿閸樻悂鏌ｈ箛鏇炰哗妞ゆ泦鍕弿闁稿本渚楀▓浠嬫煟閹邦厽鍎楁繛鍫熸⒐閵囧嫰顢樺鍐潎閻庤娲忛崝鎴︺€佸☉妯锋瀻闁瑰濮甸崰鎺戔攽閻樿尙妫勯柡澶婄氨閸嬫捁顦寸€垫澘锕ョ粋鎺斺偓锝庝簽閺屽牆顪冮妶鍡欏⒈闁稿鍋ゅ畷鎴﹀磼濞戞氨顔曢梺绯曞墲钃遍悘蹇庡嵆閺屾稒绻濋崟顒佹瘓闂佸搫鐭夌紞浣规叏閳ь剟鏌嶉挊澶嬵棞闁哄懘浜跺铏圭磼濡儤璇炵紓浣哄У閻楃姴顕ｇ拠宸悑闁割偒鍋呴鍥⒒娴ｅ憡鍟為柟姝岊嚙閻ｆ繄绮欑捄銊︽閻熸粎澧楃敮妤呭磻閵娾晜鈷掗柛顐ｇ濞呭洨绱掔€ｎ亞绠伴柍瑙勫灴閹晝绱掑Ο濠氭暘闂備胶绮〃鍛存晝閵堝鍋╅梺鍨儏缁剁偤鏌熼柇锕€骞橀柛妯哄船閳规垿鎮╃紒妯婚敪濠碘槅鍋呴〃濠囥€侀弮鍫濈厸闁稿本绮庨鏇㈡⒑閸撴彃浜濈紒瀣灴閸┾偓妞ゆ帊鑳剁粻鎾淬亜椤愩垻绠伴悡銈嗐亜韫囨挻鍣瑰ù鐙€鍙冨娲传閸曞灚效闁诲海鐟抽崶褏锛欏銈嗙墱閸嬬偤鍩涢幋婢濆綊宕楅懖鈺傚櫘缂備礁顦靛褔婀佸┑鐘诧工缁ㄨ偐鑺辨繝姘厽闁挎繂鎳庡Σ濠氭煃鐟欏嫬鐏寸€规洟浜堕崺鈩冩媴閻熸壋鍋撻姘ｆ斀闁绘﹩鍠栭悘杈ㄧ箾婢跺娲存い銏＄墵瀹曘劑顢欑紒銏￠敜婵犲痉鏉库偓鎰板磻閹剧粯鐓冮悷娆忓閻忔挳鏌熼鐣屾噰鐎规洩绲惧鍕熸导娆戠＜闂傚倸鍊风粈渚€骞夐垾鎰佹綎鐟滅増甯掗崹鍌炴煕閹捐尪鍏岄柣顓烆槺閳ь剙绠嶉崕閬嶅箯鐎ｎ喗鍋傞柕澶嗘櫆閻撴洘銇勯幇鈺佲偓鏇㈠几閺冨牊鐓曟俊顖滅帛閸婃劙鏌熼绛嬫疁闁绘侗鍣ｅ畷褰掝敊閻撳寒娼涢梻鍌欑閹芥粓宕抽妷鈺佺；闁告侗鍠氶埞宥呪攽閻樺弶鎼愰梺瑁ゅ€栨穱濠囧Χ閸曨喖鍘￠梺鍛娚戦幑鍥ь潖濞差亝鍤嶉柕澶婂枤娴滎亣妫熼梺鑺ッ敍澶愭晲閸稐姹楅梺鍦劋閹搁箖宕㈤鍫熲拺闁硅偐鍋涢崝鈧梺鍛婂姇瑜扮偟妲愰弮鍫熺厽閹兼番鍩勯崯蹇涙煕閻樻剚娈滄鐐村姍楠炲酣鎸婃径宀€鏆梻渚€娼х换鍫ュ磹閺嶎厼绠氶柣鎰劋閻撴洟鏌ㄩ弮鍥跺殭妤犵偞鐗犻幃浠嬵敍濡搫顫囧┑顔硷工椤嘲鐣烽幒鎴旀瀻闁规惌鍘借ⅵ闂傚倷绀佸﹢閬嶅煕閸儱纾诲┑鐘插亞閸ゆ洟鏌ｉ姀鐘差棌闁轰礁妫濋弻娑㈠即閵娿儱顫╅梺鍛婃惄閸犳牠鈥旈崘顔嘉ч柛鈩冪懃椤呯磽娴ｅ壊鍎愰柛鏃€顨婇獮鎴﹀閵堝懎鑰垮┑鈽嗗灥椤曆冾嚕閸喒鏀介柣妯肩帛濞懷勪繆椤愶絿娲撮柟顔惧仱閹瑩顢栫捄銊х暰闂備礁婀辩划顖滄暜閸ヮ剙纾婚柕蹇婂墲閸欏繐鈹戦悩鎻掓殲闁靛洦绻勯埀顒冾潐濞诧箓宕戞繝鍌滄殾闁绘梻鈷堥弫鍡楊熆鐠轰警鍎涙俊顐ｆ崌濮婂宕掑▎鎴М闂佸湱鈷堥崑濠囩嵁婵犲洤绠涙い鎾跺Х椤旀洟姊洪柅鐐茶嫰婢т即鏌?${payload.changeType}`,
      () => adapter.createTerrainChangeSet(payload),
    );
  }
  resetTerrainChangeForm();
}

function loadSelectedTerrainChangeIntoForm() {
  const record = getSelectedRecord();
  if (!record || selectedDetail.kind !== "terrainChange") {
    logAction("Load failed: select a terrain change record first");
    renderLog();
    return;
  }
  elements.terrainChangeWorkArea.value = record.workAreaId || "";
  elements.terrainChangeType.value = record.changeType || "fill";
  elements.terrainChangeQuantityId.value = record.quantityId || "";
  elements.terrainChangeSpatialId.value = record.spatialRawObjectId || "";
  elements.terrainChangeTerrainId.value = record.terrainRawObjectId || "";
  elements.terrainChangeDay.value = String(record.recordDay ?? state.currentDay);
  elements.terrainChangeResultRef.value = record.resultRef || "";
  elements.terrainChangeNotes.value = record.notes || "";
}

function handleTerrainChangeClick(event) {
  const card = event.target.closest("[data-terrain-change-card]");
  if (!card) {
    return;
  }

  selectedDetail = { kind: "terrainChange", id: card.dataset.terrainChangeCard };
  renderTerrainChangeSets();
  renderDetailPanel();
}

const __originalKindLabel2 = kindLabel;
kindLabel = function kindLabelWithTerrainChange(kind) {
  if (kind === "terrainChange") {
    return "Terrain Change";
  }
  return __originalKindLabel2(kind);
};

const __originalRenderDetailPanel2 = renderDetailPanel;
renderDetailPanel = function renderDetailPanelWithTerrainChange() {
  if (selectedDetail?.kind === "terrainChange") {
    const record = getSelectedRecord();
    if (!record) {
      elements.detailPanelContent.innerHTML = '<p class="empty-state">No terrain change selected</p>';
      return;
    }

    elements.detailPanelContent.innerHTML = [
      detailSection("Terrain Change", [
        ["Type", terrainChangeTypeLabel(record.changeType)],
        ["Work Area", workAreaName(record.workAreaId)],
        ["Quantity ID", record.quantityId || "-"],
        ["Spatial Object ID", record.spatialRawObjectId || "-"],
        ["Terrain Object ID", record.terrainRawObjectId || "-"],
        ["Day", `Day ${record.recordDay ?? 0}`],
      ]),
      detailSection("Result Ref", [["Content", record.resultRef || "No result reference"]]),
      detailSection("Notes", [["Content", record.notes || "No notes"]]),
    ].join("");
    return;
  }

  __originalRenderDetailPanel2();
};

const __originalRenderDetailPanel3 = renderDetailPanel;
renderDetailPanel = function renderDetailPanelWithIntegratedChanges() {
  __originalRenderDetailPanel3();

  if (selectedDetail?.kind === "quantity") {
    const terrainChangeSets = (state.terrainChangeSets || []).filter((item) => item.quantityId === selectedDetail.id);
    elements.detailPanelContent.innerHTML += [
      detailSection("Terrain Change Summary", [
        ["Count", String(terrainChangeSets.length)],
        ["Latest Type", terrainChangeSets[0]?.changeType || "-"],
        ["Latest Day", terrainChangeSets[0] ? `D${terrainChangeSets[0].recordDay ?? 0}` : "-"],
      ]),
      relatedRecordSection("Terrain Change Records", terrainChangeSets, "terrainChange", (item) => ({
        title: terrainChangeTypeLabel(item.changeType),
        meta: `${item.resultRef || "No result reference"} / ${item.terrainRawObjectId || "no-terrain"}`,
        tone: "ok",
      })),
    ].join("");
  }
};
