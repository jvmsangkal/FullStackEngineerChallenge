<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-data-table
        :headers="headers"
        :items="assignments"
        :options.sync="options"
        :server-items-length="totalAssignments"
        :loading="loading"
        loading-text="Loading... Please wait"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Feedback Assignments</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="700px">
              <v-card v-if="activeAssignment">
                <v-card-title>
                  <span class="headline"
                    >{{ activeAssignment.assignedUser.firstName }}
                    {{ activeAssignment.assignedUser.lastName }}</span
                  >
                </v-card-title>
                <v-card-subtitle>
                  <span>{{ activeAssignment.performanceReview.name }}</span>
                </v-card-subtitle>

                <v-card-text>
                  <v-container>
                    <v-form v-model="valid" @submit.prevent="submitFeedback">
                      <v-row
                        v-for="category in activeAssignment.performanceReview
                          .categories"
                        :key="category.id"
                      >
                        <v-col cols="12" sm="12" md="12">
                          <p>{{ category.description }}</p>
                          <v-radio-group
                            v-model="category.rating"
                            label="Rating"
                            :rules="[(v) => !!v || 'Rating is required']"
                            dense
                            row
                          >
                            <v-radio label="1" value="1"></v-radio>
                            <v-radio label="2" value="2"></v-radio>
                            <v-radio label="3" value="3"></v-radio>
                            <v-radio label="4" value="4"></v-radio>
                            <v-radio label="5" value="5"></v-radio>
                          </v-radio-group>
                          <v-text-field
                            v-model="category.explanation"
                            label="Brief explanation"
                            :rules="[
                              (v) => !!v || 'Brief explanation is required'
                            ]"
                            required
                            dense
                          ></v-text-field>
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
                  <v-btn color="blue darken-1" text @click="submitFeedback"
                    >Submit Feedback</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small @click="openFeedbackForm(item)">
            mdi-account-edit-outline
          </v-icon>
        </template>
        <template v-slot:no-data>
          No Feedback Assignment
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: 'isEmployee',
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
    activeAssignment: null
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
  },

  methods: {
    async getPerformanceReviews() {
      const response = await this.$axios('/api/performance_reviews', {
        params: { all: 1 }
      })

      this.performanceReviews = response.data.performanceReviews
    },

    async getDataFromApi() {
      this.loading = true
      const { page, itemsPerPage: limit } = this.options
      const offset = (page - 1) * limit

      const data = await this.$axios.$get(`/api/users/me/reviewees`, {
        params: { limit, offset }
      })

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

    openFeedbackForm(item) {
      this.activeAssignment = item
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.activeAssignment = false
      })
    },

    async submitFeedback() {
      if (!this.valid) {
        return
      }

      try {
        await this.$axios.$post(
          `/api/users/${this.activeAssignment.assignedUserId}/feedbacks/`,
          {
            feedback: {
              performanceReviewId: this.activeAssignment.performanceReviewId,
              answers: this.activeAssignment.performanceReview.categories.map(
                (category) => ({
                  reviewCategoryId: category.id,
                  rating: +category.rating,
                  explanation: category.explanation
                })
              )
            }
          }
        )
        this.$nuxt.$emit('snackbar', {
          color: 'success',
          message: 'Successfully submitted feedback!'
        })

        this.close()
      } catch (err) {
        this.$nuxt.$emit('snackbar', {
          color: 'error',
          message: 'Something went wrong!'
        })
      }
    }
  }
}
</script>
