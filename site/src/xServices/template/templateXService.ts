import { assign, createMachine } from "xstate"
import {
  getTemplateByName,
  getTemplateVersion,
  getTemplateVersionResources,
  getTemplateVersions,
} from "../../api/api"
import { Template, TemplateVersion, WorkspaceResource } from "../../api/typesGenerated"

interface TemplateContext {
  organizationId: string
  templateName: string
  template?: Template
  activeTemplateVersion?: TemplateVersion
  templateResources?: WorkspaceResource[]
  templateVersions?: TemplateVersion[]
}

export const templateMachine = createMachine(
  {
    schema: {
      context: {} as TemplateContext,
      services: {} as {
        getTemplate: {
          data: Template
        }
        getActiveTemplateVersion: {
          data: TemplateVersion
        }
        getTemplateResources: {
          data: WorkspaceResource[]
        }
        getTemplateVersions: {
          data: TemplateVersion[]
        }
      },
    },
    tsTypes: {} as import("./templateXService.typegen").Typegen0,
    initial: "gettingTemplate",
    states: {
      gettingTemplate: {
        invoke: {
          src: "getTemplate",
          onDone: {
            actions: ["assignTemplate"],
            target: "initialInfo",
          },
        },
      },
      initialInfo: {
        type: "parallel",
        onDone: "loaded",
        states: {
          activeTemplateVersion: {
            initial: "gettingActiveTemplateVersion",
            states: {
              gettingActiveTemplateVersion: {
                invoke: {
                  src: "getActiveTemplateVersion",
                  onDone: {
                    actions: ["assignActiveTemplateVersion"],
                    target: "success",
                  },
                },
              },
              success: { type: "final" },
            },
          },
          templateResources: {
            initial: "gettingTemplateResources",
            states: {
              gettingTemplateResources: {
                invoke: {
                  src: "getTemplateResources",
                  onDone: {
                    actions: ["assignTemplateResources"],
                    target: "success",
                  },
                },
              },
              success: { type: "final" },
            },
          },
          templateVersions: {
            initial: "gettingTemplateVersions",
            states: {
              gettingTemplateVersions: {
                invoke: {
                  src: "getTemplateVersions",
                  onDone: {
                    actions: ["assignTemplateVersions"],
                    target: "success",
                  },
                },
              },
              success: { type: "final" },
            },
          },
        },
      },
      loaded: {},
    },
  },
  {
    services: {
      getTemplate: (ctx) => getTemplateByName(ctx.organizationId, ctx.templateName),
      getActiveTemplateVersion: (ctx) => {
        if (!ctx.template) {
          throw new Error("Template not loaded")
        }

        return getTemplateVersion(ctx.template.active_version_id)
      },
      getTemplateResources: (ctx) => {
        if (!ctx.template) {
          throw new Error("Template not loaded")
        }

        return getTemplateVersionResources(ctx.template.active_version_id)
      },
      getTemplateVersions: (ctx) => {
        if (!ctx.template) {
          throw new Error("Template not loaded")
        }

        return getTemplateVersions(ctx.template.id)
      },
    },
    actions: {
      assignTemplate: assign({
        template: (_, event) => event.data,
      }),
      assignActiveTemplateVersion: assign({
        activeTemplateVersion: (_, event) => event.data,
      }),
      assignTemplateResources: assign({
        templateResources: (_, event) => event.data,
      }),
      assignTemplateVersions: assign({
        templateVersions: (_, event) => event.data,
      }),
    },
  },
)
