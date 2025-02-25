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
<template>
  <div class="list-model">
    <div class="table-box">
      <el-table :data="list" size="mini" style="width: 100%">
        <el-table-column type="index" :label="$t('#')" width="50"></el-table-column>
        <el-table-column prop="groupName" :label="$t('Group Name')"></el-table-column>
        <el-table-column :label="$t('Alarm plugin instance')">
          <template slot-scope="scope">
            <el-tag
              style="margin: 0 2px 0 0"
              v-for="item in scope.row.instanceNames"
              :key="item"
              size="mini"
              effect="light">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="$t('Remarks')" width="200">
          <template slot-scope="scope">
            <span>{{scope.row.description | filterNull}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Create Time')" width="140">
          <template slot-scope="scope">
            <span>{{scope.row.createTime | formatDate}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Update Time')" width="140">
          <template slot-scope="scope">
            <span>{{scope.row.updateTime | formatDate}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Operation')" width="100">
          <template slot-scope="scope">
            <el-tooltip :content="$t('Edit')" placement="top">
              <span><el-button type="primary" size="mini" icon="el-icon-edit-outline" @click="_edit(scope.row)" circle></el-button></span>
            </el-tooltip>
            <el-tooltip :content="$t('Delete')" placement="top">
              <el-popconfirm
                :confirmButtonText="$t('Confirm')"
                :cancelButtonText="$t('Cancel')"
                icon="el-icon-info"
                iconColor="red"
                :title="$t('Delete?')"
                @onConfirm="_delete(scope.row,scope.row.id)"
              >
                <el-button v-if="scope.row.id !== 1" type="danger" size="mini" icon="el-icon-delete" circle slot="reference"></el-button>
              </el-popconfirm>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
  import { mapActions } from 'vuex'
  import _ from 'lodash'

  export default {
    name: 'user-list',
    data () {
      return {
        list: [],
        transferDialog: false,
        item: {},
        allAlertPluginInstance: []
      }
    },
    props: {
      alertgroupList: Array,
      pageNo: Number,
      pageSize: Number
    },
    methods: {
      ...mapActions('security', ['deleteAlertgrou', 'grantAuthorization', 'queryAllAlertPluginInstance']),
      _delete (item, i) {
        this.deleteAlertgrou({
          id: item.id
        }).then(res => {
          this.$emit('on-update')
          this.$message.success(res.msg)
        }).catch(e => {
          this.$message.error(e.msg || '')
        })
      },
      _edit (item) {
        this.$emit('on-edit', item)
      },
      onUpdate (userIds) {
        this._grantAuthorization('alert-group/grant-user', {
          userIds: userIds,
          alertgroupId: this.item.id
        })
        this.transferDialog = false
      },
      close () {
        this.transferDialog = false
      },

      _grantAuthorization (api, param) {
        this.grantAuthorization({
          api: api,
          param: param
        }).then(res => {
          this.$message.success(res.msg)
        }).catch(e => {
          this.$message.error(e.msg || '')
        })
      }
    },
    watch: {
      alertgroupList (a) {
        this.list = []
        setTimeout(() => {
          this.queryAllAlertPluginInstance().then(res => {
            const alertPluginInstanceMapping = {}
            res.forEach(instance => {
              alertPluginInstanceMapping[instance.id] = instance.instanceName
            })
            if (a) {
              a.forEach(item => {
                let alertInstanceArray = _.split(item.alertInstanceIds, ',')
                let instanceNames = []
                alertInstanceArray.forEach(id => {
                  instanceNames.push(alertPluginInstanceMapping[id])
                })
                item.instanceNames = instanceNames
              })
            }
            this.list = a
          }).catch(e => {
            this.$message.error(e.msg)
          })
        })
      }
    },
    created () {
      this.queryAllAlertPluginInstance().then(res => {
        const alertPluginInstanceMapping = {}
        res.forEach(instance => {
          alertPluginInstanceMapping[instance.id] = instance.instanceName
        })
        if (this.alertgroupList) {
          this.alertgroupList.forEach(item => {
            let alertInstanceArray = _.split(item.alertInstanceIds, ',')
            let instanceNames = []
            alertInstanceArray.forEach(id => {
              instanceNames.push(alertPluginInstanceMapping[id])
            })
            item.instanceNames = instanceNames
          })
        }
        this.list = this.alertgroupList
      }).catch(e => {
        this.$message.error(e.msg)
      })
    },
    mounted () {
    },
    components: {}
  }
</script>
