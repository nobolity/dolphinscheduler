/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  defineComponent,
  PropType,
  ref,
  watch,
  nextTick,
  provide,
  computed,
  h,
  Ref
} from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/modal'
import Detail from './detail'
import { formatModel } from './format-data'
import {
  HistoryOutlined,
  ProfileOutlined,
  QuestionCircleTwotone
} from '@vicons/antd'
import { NIcon } from 'naive-ui'
import { TASK_TYPES_MAP } from '../../constants/task-type'
import { Router, useRouter } from 'vue-router'
import type {
  ITaskData,
  ITaskType,
  EditWorkflowDefinition,
  IWorkflowTaskInstance,
  WorkflowInstance
} from './types'

const props = {
  show: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  data: {
    type: Object as PropType<ITaskData>,
    default: { code: 0, taskType: 'SHELL', name: '' }
  },
  projectCode: {
    type: Number as PropType<number>,
    required: true
  },
  readonly: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  from: {
    type: Number as PropType<number>,
    default: 0
  },
  definition: {
    type: Object as PropType<Ref<EditWorkflowDefinition>>
  },
  processInstance: {
    type: Object as PropType<WorkflowInstance>
  },
  taskInstance: {
    type: Object as PropType<IWorkflowTaskInstance>
  },
  saving: {
    type: Boolean,
    default: false
  }
}

const NodeDetailModal = defineComponent({
  name: 'NodeDetailModal',
  props,
  emits: ['cancel', 'submit', 'viewLog'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const router: Router = useRouter()
    const renderIcon = (icon: any) => {
      return () => h(NIcon, null, { default: () => h(icon) })
    }
    const detailRef = ref()

    const onConfirm = async () => {
      await detailRef.value.value.validate()
      emit('submit', { data: detailRef.value.value.getValues() })
    }
    const onCancel = () => {
      emit('cancel')
    }

    const headerLinks = ref([] as any)

    const handleViewLog = () => {
      if (props.taskInstance) {
        emit('viewLog', props.taskInstance.id, props.taskInstance.taskType)
      }
    }

    const initHeaderLinks = (processInstance: any, taskType?: ITaskType) => {
      headerLinks.value = [
        {
          text: t('project.node.instructions'),
          show:
            taskType && !TASK_TYPES_MAP[taskType]?.helperLinkDisable
              ? true
              : false,
          action: () => {
            const helpUrl =
              'https://dolphinscheduler.apache.org/' +
              locale.value.toLowerCase().replace('_', '-') +
              '/docs/latest/user_doc/guide/task/' +
              taskType?.toLowerCase().replace('_', '-') +
              '.html'
            window.open(helpUrl)
          },
          icon: renderIcon(QuestionCircleTwotone)
        },
        {
          text: t('project.node.view_history'),
          show: props.taskInstance ? true : false,
          action: () => {
            router.push({
              name: 'task-instance',
              params: { processInstanceId: processInstance.id }
            })
          },
          icon: renderIcon(HistoryOutlined)
        },
        {
          text: t('project.node.view_log'),
          show: props.taskInstance ? true : false,
          action: () => {
            handleViewLog()
          },
          icon: renderIcon(ProfileOutlined)
        }
      ]
    }

    const onTaskTypeChange = (taskType: ITaskType) => {
      // eslint-disable-next-line vue/no-mutating-props
      props.data.taskType = taskType
      initHeaderLinks(props.processInstance, props.data.taskType)
    }

    provide(
      'data',
      computed(() => ({
        projectCode: props.projectCode,
        data: props.data,
        from: props.from,
        readonly: props.readonly,
        definition: props.definition
      }))
    )

    watch(
      () => [props.show, props.data],
      async () => {
        if (!props.show) return
        initHeaderLinks(props.processInstance, props.data.taskType)
        await nextTick()
        detailRef.value.value.setValues(formatModel(props.data))
      }
    )

    return () => (
      <Modal
        show={props.show}
        title={`${t('project.node.current_node_settings')}`}
        onConfirm={onConfirm}
        confirmLoading={props.saving}
        confirmDisabled={props.readonly}
        onCancel={onCancel}
        headerLinks={headerLinks}
      >
        <Detail
          ref={detailRef}
          onTaskTypeChange={onTaskTypeChange}
          key={props.data.taskType}
        />
      </Modal>
    )
  }
})

export default NodeDetailModal
