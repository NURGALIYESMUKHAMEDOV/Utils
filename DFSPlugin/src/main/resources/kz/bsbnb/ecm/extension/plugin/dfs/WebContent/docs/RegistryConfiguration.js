define([
    "dojo/_base/declare",
    "pvd/widget/designer/settings/TextBoxSetting",
    "docs/correspondent/CorrespondentBoxEditor",
    "docs/registry/RegistryBoxEditor",
    "docs/category/CategoryBoxEditor",
    "docs/user/UserBoxEditor",
    "docs/quiz/QuizBoxEditor",
    "docs/employee/EmployeeBoxEditor",
    "docs/employee/EmployeesBoxEditor",
    "docs/employee/DivisionAndEmployeeBoxEditor",
    "docs/directory/DirectoryEntryBoxEditor",
    "docs/document/DocumentBoxEditor",
    "docs/document/DocumentsBoxEditor",
    "docs/cases/CaseBoxEditor",
    "docs/resolution/ResolutionsBoxEditor",
    "docs/assignment/AssignmentsBoxEditor",
    "docs/division/DivisionBoxEditor",
    "docs/inoutdocs/InOutDocsEntryBoxEditor"
], function(
    declare,
    TextBoxSetting,
    CorrespondentBoxEditor,
    RegistryBoxEditor,
    CategoryBoxEditor,
    UserBoxEditor,
    QuizBoxEditor,
    EmployeeBoxEditor,
    EmployeesBoxEditor,
    DivisionAndEmployeeBoxEditor,
    DirectoryEntryBoxEditor,
    DocumentBoxEditor,
    DocumentsBoxEditor,
    CaseBoxEditor,
    ResolutionsBoxEditor,
    AssignmentsBoxEditor,
    DivisionBoxEditor,
    InOutDocsEntryBoxEditor
) {

    console.log("инициализация конфигурации редакторов ...");

    return {
        editors: {
            editorConfigs: {
                "correspondentBoxEditor": {
                    label: "Корреспондент",
                    editorClass: CorrespondentBoxEditor
                },
                "registryBoxEditor": {
                    label: "Номенклатура дела",
                    editorClass: RegistryBoxEditor
                },
                "categoryBoxEditor": {
                    label: "Категория",
                    editorClass: CategoryBoxEditor
                },
                "userBoxEditor": {
                    label: "Пользователь",
                    editorClass: UserBoxEditor
                },
                "quizBoxEditor": {
                    label: "Вопросник",
                    editorClass: QuizBoxEditor
                },
                "employeeBoxEditor": {
                    label: "Сотрудник",
                    editorClass: EmployeeBoxEditor,
                    settings: [
                        {
                            name: "divisionPropertyName",
                            controlClass: TextBoxSetting,
                            controlParams: {
                                label: "Стр подразделение",
                                help: "Свойство указывающее на структурное подразделение"
                            }
                        }
                    ]
                },
                "employeesBoxEditor": {
                    label: "Сотрудники",
                    editorClass: EmployeesBoxEditor,
                    settings: [
                        {
                            name: "divisionPropertyName",
                            controlClass: TextBoxSetting,
                            controlParams: {
                                label: "Стр подразделение",
                                help: "Свойство указывающее на структурное подразделение"
                            }
                        }
                    ]
                },
                "documentsBoxEditor": {
                    label: "Документы",
                    editorClass: DocumentsBoxEditor,
                    settings: [
                        {
                            name: "documentTypes",
                            controlClass: TextBoxSetting,
                            controlParams: {
                                label: "Типы документов",
                                help: "Типы документов, которые должны быть приложены к кейсу"
                            }
                        }
                    ]
                },
                "divisionAndEmployeeBoxEditor": {
                    label: "Структурное подразделение / Сотрудник",
                    editorClass: DivisionAndEmployeeBoxEditor
                },
                "directoryEntryBoxEditor": {
                    label: "Индекс дела",
                    editorClass: DirectoryEntryBoxEditor
                },
                "documentBoxEditor": {
                    label: "Документ",
                    editorClass: DocumentBoxEditor,
                    settings: [
                        {
                            name: "entryTemplateId",
                            controlClass: TextBoxSetting,
                            controlParams: {
                                label: "Шаблон ввода",
                                help: "Идентификатор шаблона ввода"
                            }
                        }
                    ]
                },
                "caseBoxEditor": {
                    label: "Дело",
                    editorClass: CaseBoxEditor
                },
                "resolutionsBoxEditor": {
                    label: "Резолюции",
                    editorClass: ResolutionsBoxEditor
                },
                "assignmentsBoxEditor": {
                    label: "Поручения",
                    editorClass: AssignmentsBoxEditor
                },
                "divisionBoxEditor": {
                    label: "Структурное подразделение",
                    editorClass: DivisionBoxEditor
                },

                "InOutDocsEntryBoxEditor": {
                    label: "Входящий и исходящий",
                    editorClass: InOutDocsEntryBoxEditor
                }
            },
            mappings: {
                types: {
                    "string": {
                        single: {
                            editorConfigs: [
                                "correspondentBoxEditor",
                                "registryBoxEditor",
                                "categoryBoxEditor",
                                "userBoxEditor",
                                "quizBoxEditor",
                                "divisionAndEmployeeBoxEditor",
                                "directoryEntryBoxEditor",
                                "documentBoxEditor",
                                "caseBoxEditor",
                                "resolutionsBoxEditor",
                                "assignmentsBoxEditor",
                                "InOutDocsEntryBoxEditor"
                            ]
                        },
                        multi: {
                            editorConfigs: [
                                "documentsBoxEditor"
                            ]
                        }
                    },
                    "integer": {
                        single: {
                            editorConfigs: [
                                "divisionBoxEditor",
                                "employeeBoxEditor"
                            ]
                        },
                        multi: {
                            editorConfigs: [
                                "employeesBoxEditor"
                            ]
                        }
                    }
                }
            }
        }
    }
});