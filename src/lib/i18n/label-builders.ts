import type { TranslationKey } from "@/lib/i18n/messages";

/** Strict translator from {@link createTranslator} / {@link getTranslator}. */
export type Translator = (key: TranslationKey) => string;

export type TaskFormLabels = {
  description: string;
  site: string;
  assignTo: string;
  malfunctionOptional: string;
  status: string;
  statusDetails: string;
  createTask: string;
  creating: string;
  couldNotCreate: string;
  none: string;
};

export function buildTaskFormLabels(t: Translator): TaskFormLabels {
  return {
    description: t("tasks.description"),
    site: t("tasks.site"),
    assignTo: t("tasks.formAssignTo"),
    malfunctionOptional: t("tasks.formMalfunctionOptional"),
    status: t("tasks.status"),
    statusDetails: t("tasks.statusDetails"),
    createTask: t("tasks.formCreateTask"),
    creating: t("common.creating"),
    couldNotCreate: t("tasks.formCouldNotCreate"),
    none: t("common.none"),
  };
}

export type EditTaskFormLabels = {
  description: string;
  site: string;
  assignTo: string;
  malfunctionOptional: string;
  status: string;
  statusDetails: string;
  none: string;
  save: string;
  saving: string;
  couldNotSave: string;
};

export function buildEditTaskFormLabels(t: Translator): EditTaskFormLabels {
  return {
    description: t("tasks.description"),
    site: t("tasks.site"),
    assignTo: t("tasks.formAssignTo"),
    malfunctionOptional: t("tasks.formMalfunctionOptional"),
    status: t("tasks.status"),
    statusDetails: t("tasks.statusDetails"),
    none: t("common.none"),
    save: t("common.save"),
    saving: t("common.saving"),
    couldNotSave: t("common.couldNotSave"),
  };
}

export type MalfunctionFormLabels = {
  title: string;
  description: string;
  site: string;
  reporter: string;
  taskOptional: string;
  status: string;
  create: string;
  creating: string;
  couldNotCreate: string;
  none: string;
};

export function buildMalfunctionFormLabels(t: Translator): MalfunctionFormLabels {
  return {
    title: t("malfunctions.formTitle"),
    description: t("malfunctions.formDescription"),
    site: t("malfunctions.formSite"),
    reporter: t("malfunctions.formReporter"),
    taskOptional: t("malfunctions.formTaskOptional"),
    status: t("malfunctions.formStatus"),
    create: t("malfunctions.formCreate"),
    creating: t("common.creating"),
    couldNotCreate: t("malfunctions.couldNotCreate"),
    none: t("common.none"),
  };
}

export type EditMalfunctionFormLabels = {
  title: string;
  description: string;
  site: string;
  reporter: string;
  taskOptional: string;
  status: string;
  none: string;
  save: string;
  saving: string;
  couldNotSave: string;
};

export function buildEditMalfunctionFormLabels(t: Translator): EditMalfunctionFormLabels {
  return {
    title: t("malfunctions.formTitle"),
    description: t("malfunctions.formDescription"),
    site: t("malfunctions.formSite"),
    reporter: t("malfunctions.formReporter"),
    taskOptional: t("malfunctions.formTaskOptional"),
    status: t("malfunctions.formStatus"),
    none: t("common.none"),
    save: t("common.save"),
    saving: t("common.saving"),
    couldNotSave: t("common.couldNotSave"),
  };
}

export type NewAchievementFormLabels = {
  formType: string;
  formTypeCustom: string;
  formTypeComputed: string;
  formTitle: string;
  description: string;
  formSiteScope: string;
  allSites: string;
  metric: string;
  timeWindow: string;
  metricTasksDone: string;
  metricTasksClosed: string;
  metricMalfunctionsClosed: string;
  metricMalfunctionsDoneOnTask: string;
  windowDay: string;
  windowWeek: string;
  windowMonth: string;
  windowAll: string;
  formActualValue: string;
  formActualPlaceholder: string;
  status: string;
  create: string;
  creating: string;
  couldNotCreate: string;
};

export function buildNewAchievementFormLabels(t: Translator): NewAchievementFormLabels {
  return {
    formType: t("achievements.formType"),
    formTypeCustom: t("achievements.formTypeCustom"),
    formTypeComputed: t("achievements.formTypeComputed"),
    formTitle: t("achievements.formTitle"),
    description: t("tasks.description"),
    formSiteScope: t("achievements.formSiteScope"),
    allSites: t("achievements.detailAllSites"),
    metric: t("achievements.formMetric"),
    timeWindow: t("achievements.formTimeWindow"),
    metricTasksDone: t("achievements.metricTasksDone"),
    metricTasksClosed: t("achievements.metricTasksClosed"),
    metricMalfunctionsClosed: t("achievements.metricMalfunctionsClosed"),
    metricMalfunctionsDoneOnTask: t("achievements.metricMalfunctionsDoneOnTask"),
    windowDay: t("achievements.windowDay"),
    windowWeek: t("achievements.windowWeek"),
    windowMonth: t("achievements.windowMonth"),
    windowAll: t("achievements.windowAll"),
    formActualValue: t("achievements.formActualValue"),
    formActualPlaceholder: t("achievements.formActualPlaceholder"),
    status: t("tasks.status"),
    create: t("common.create"),
    creating: t("common.creating"),
    couldNotCreate: t("common.couldNotCreate"),
  };
}

export type EditAchievementFormLabels = {
  formTitle: string;
  description: string;
  formSiteScope: string;
  allSites: string;
  status: string;
  formActualValue: string;
  save: string;
  saving: string;
  couldNotSave: string;
  typeLocked: string;
};

export function buildEditAchievementFormLabels(t: Translator): EditAchievementFormLabels {
  return {
    formTitle: t("achievements.formTitle"),
    description: t("tasks.description"),
    formSiteScope: t("achievements.formSiteScope"),
    allSites: t("achievements.detailAllSites"),
    status: t("tasks.status"),
    formActualValue: t("achievements.formActualValue"),
    save: t("common.save"),
    saving: t("common.saving"),
    couldNotSave: t("common.couldNotSave"),
    typeLocked: t("achievements.formTypeLocked"),
  };
}

export type UsersAdminTableLabels = {
  tableEmail: string;
  tableName: string;
  tableRole: string;
  tableStatus: string;
  tableActions: string;
  statusDeleted: string;
  statusActive: string;
  statusInactive: string;
  view: string;
  edit: string;
  activity: string;
  deactivate: string;
  activate: string;
  delete: string;
  you: string;
  protected: string;
  updateFailed: string;
  deleteFailed: string;
  confirmDeleteUser: string;
  none: string;
};

export function buildUsersAdminTableLabels(t: Translator): UsersAdminTableLabels {
  return {
    tableEmail: t("adminUsers.tableEmail"),
    tableName: t("adminUsers.tableName"),
    tableRole: t("adminUsers.tableRole"),
    tableStatus: t("adminUsers.tableStatus"),
    tableActions: t("adminUsers.tableActions"),
    statusDeleted: t("adminUsers.statusDeleted"),
    statusActive: t("adminUsers.statusActive"),
    statusInactive: t("adminUsers.statusInactive"),
    view: t("tasks.view"),
    edit: t("common.edit"),
    activity: t("adminUsers.activity"),
    deactivate: t("adminUsers.deactivate"),
    activate: t("adminUsers.activate"),
    delete: t("adminUsers.delete"),
    you: t("adminUsers.you"),
    protected: t("adminUsers.protected"),
    updateFailed: t("common.updateFailed"),
    deleteFailed: t("common.deleteFailed"),
    confirmDeleteUser: t("common.confirmDeleteUser"),
    none: t("common.none"),
  };
}

export type NewUserFormLabels = {
  email: string;
  passwordHint: string;
  displayNameOptional: string;
  role: string;
  selectRole: string;
  createUser: string;
  creating: string;
  couldNotCreateUser: string;
};

export function buildNewUserFormLabels(t: Translator): NewUserFormLabels {
  return {
    email: t("auth.email"),
    passwordHint: t("adminForms.userPasswordHint"),
    displayNameOptional: t("adminForms.displayNameOptional"),
    role: t("adminForms.role"),
    selectRole: t("common.selectRole"),
    createUser: t("adminForms.createUser"),
    creating: t("common.creating"),
    couldNotCreateUser: t("adminForms.couldNotCreateUser"),
  };
}

export type NewSiteFormLabels = {
  siteName: string;
  createSite: string;
  creating: string;
  couldNotCreateSite: string;
};

export function buildNewSiteFormLabels(t: Translator): NewSiteFormLabels {
  return {
    siteName: t("adminForms.siteName"),
    createSite: t("adminForms.createSite"),
    creating: t("common.creating"),
    couldNotCreateSite: t("adminForms.couldNotCreateSite"),
  };
}

export type NewRoleFormLabels = {
  roleName: string;
  rolePlaceholder: string;
  descriptionOptional: string;
  createRole: string;
  creating: string;
  couldNotCreateRole: string;
};

export function buildNewRoleFormLabels(t: Translator): NewRoleFormLabels {
  return {
    roleName: t("adminForms.roleName"),
    rolePlaceholder: t("adminForms.rolePlaceholder"),
    descriptionOptional: t("adminForms.descriptionOptional"),
    createRole: t("adminForms.createRole"),
    creating: t("common.creating"),
    couldNotCreateRole: t("adminForms.couldNotCreateRole"),
  };
}

export type NewPermissionFormLabels = {
  permissionCode: string;
  permissionPlaceholder: string;
  descriptionOptional: string;
  createPermission: string;
  creating: string;
  couldNotCreatePermission: string;
};

export function buildNewPermissionFormLabels(t: Translator): NewPermissionFormLabels {
  return {
    permissionCode: t("adminForms.permissionCode"),
    permissionPlaceholder: t("adminForms.permissionPlaceholder"),
    descriptionOptional: t("adminForms.descriptionOptional"),
    createPermission: t("adminForms.createPermission"),
    creating: t("common.creating"),
    couldNotCreatePermission: t("adminForms.couldNotCreatePermission"),
  };
}

export type LinkRolePermissionFormLabels = {
  role: string;
  permission: string;
  selectRole: string;
  selectPermission: string;
  linkSaving: string;
  linkSubmit: string;
  couldNotLink: string;
};

export function buildLinkRolePermissionFormLabels(t: Translator): LinkRolePermissionFormLabels {
  return {
    role: t("adminForms.role"),
    permission: t("adminForms.permission"),
    selectRole: t("common.selectRole"),
    selectPermission: t("common.selectPermission"),
    linkSaving: t("adminForms.linkSaving"),
    linkSubmit: t("adminForms.linkSubmit"),
    couldNotLink: t("adminForms.couldNotLink"),
  };
}

export type PaginationLabels = {
  pageOf: string;
  total: string;
  prev: string;
  next: string;
};

export function buildPaginationLabels(t: Translator): PaginationLabels {
  return {
    pageOf: t("pagination.pageOf"),
    total: t("pagination.total"),
    prev: t("pagination.prev"),
    next: t("pagination.next"),
  };
}
