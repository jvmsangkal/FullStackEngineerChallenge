<template>
  <v-data-table
    :headers="headers"
    :items="assignments"
    :options.sync="options"
    :server-items-length="totalAssignments"
    :loading="loading"
    loading-text="Loading... Please wait"
    class="elevation-3"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Feedback Assignments</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on"
              >Add Assignment</v-btn
            >
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">Add assignment</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-form v-model="valid" @submit.prevent="save">
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete
                        v-model="editedItem.performanceReviewId"
                        :items="performanceReviews"
                        :rules="[
                          (v) => !!v || 'Performance Review is required'
                        ]"
                        hide-no-data
                        hide-selected
                        item-text="name"
                        item-value="id"
                        label="Performance Review"
                        placeholder="Start typing to Search"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete
                        v-model="editedItem.assignedUserId"
                        :items="users"
                        :rules="[(v) => !!v || 'Assigned User is required']"
                        hide-no-data
                        hide-selected
                        item-text="email"
                        item-value="id"
                        label="Assigned User"
                        placeholder="Start typing to Search"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDialog" persistent max-width="290">
          <v-card>
            <v-card-title
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="closeDeleteDialog"
                >No</v-btn
              >
              <v-btn color="green darken-1" text @click="confirmDeleteDialog"
                >Yes</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small @click="deleteAssignment(item)">
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      No Feedback Assignment
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    dialog: false,
    valid: false,
    deleteDialog: false,
    deleteId: '',
    headers: [
      {
        text: 'Full Name',
        align: 'start',
        sortable: false,
        value: 'userName'
      },
      {
        text: 'E-mail',
        align: 'start',
        sortable: false,
        value: 'userEmail'
      },
      {
        text: 'Review Name',
        sortable: false,
        value: 'performanceReviewName'
      },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    options: {},
    loading: true,
    assignments: [],
    totalAssignments: 0,
    editedItem: {
      performanceReviewId: 0,
      assignedUserId: ''
    },
    defaultItem: {
      performanceReviewId: 0,
      assignedUserId: ''
    },
    performanceReviews: [],
    users: []
  }),

  watch: {
    dialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.getDataFromApi()
      },
      deep: true
    }
  },

  mounted() {
    this.getDataFromApi()
    this.getUsers()
    this.getPerformanceReviews()
  },

  methods: {
    async getUsers() {
      const data = await this.$axios.$get('/api/users', { params: { all: 1 } })

      this.users = data.users
    },

    async getPerformanceReviews() {
      const data = await this.$axios.$get('/api/performance_reviews', {
        params: { all: 1 }
      })

      this.performanceReviews = data.performanceReviews
    },

    async getDataFromApi() {
      this.loading = true
      const { page, itemsPerPage: limit } = this.options
      const offset = (page - 1) * limit

      const data = await this.$axios.$get(
        `/api/users/${this.userId}/feedback_assignments`,
        {
          params: { limit, offset }
        }
      )

      data.feedbackAssignments = data.feedbackAssignments.map((d) => {
        const assignedUser = d.assignedUser
        const performanceReview = d.performanceReview
        return {
          ...d,
          userName: assignedUser
            ? assignedUser.firstName + ' ' + assignedUser.lastName
            : '',
          userEmail: assignedUser ? assignedUser.email : '',
          performanceReviewName: performanceReview ? performanceReview.name : ''
        }
      })

      this.assignments = data.feedbackAssignments
      this.totalAssignments = data.total

      this.loading = false
      return data
    },

    deleteAssignment(item) {
      this.deleteDialog = true
      this.deleteId = item.id
    },

    closeDeleteDialog() {
      this.deleteDialog = false
      this.deleteId = ''
    },

    async confirmDeleteDialog() {
      try {
        await this.$axios.$delete(`/api/feedback_assignments/${this.deleteId}`)
        this.$nuxt.$emit('snackbar', {
          color: 'success',
          message: 'Successfully deleted!'
        })
      } catch (err) {
        this.$nuxt.$emit('snackbar', {
          color: 'error',
          message: 'Something went wrong!'
        })
      }
      this.getDataFromApi()
      this.deleteDialog = false
      this.deleteId = ''
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },

    async save() {
      if (!this.valid) {
        return
      }

      try {
        await this.$axios.$post('/api/feedback_assignments/', {
          feedbackAssignment: {
            ...this.editedItem,
            userId: this.userId
          }
        })
        this.$nuxt.$emit('snackbar', {
          color: 'success',
          message: 'Successfully added!'
        })
      } catch (err) {
        this.$nuxt.$emit('snackbar', {
          color: 'error',
          message: 'Something went wrong!'
        })
      }

      this.getDataFromApi()
      this.close()
    }
  }
}
</script>
