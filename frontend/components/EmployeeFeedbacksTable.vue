<template>
  <v-data-table
    :headers="headers"
    :items="feedbacks"
    :options.sync="options"
    :server-items-length="totalFeedbacks"
    :loading="loading"
    loading-text="Loading... Please wait"
    class="elevation-3 mt-8"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Feedbacks</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="700px">
          <v-card v-if="activeFeedback">
            <v-card-title>
              <span class="headline">{{ activeFeedback.reviewName }}</span>
            </v-card-title>
            <v-card-subtitle>
              <span
                >Submitted by {{ activeFeedback.submittedBy }} on
                {{ activeFeedback.submittedAt }}</span
              >
            </v-card-subtitle>
            <v-card-text>
              <v-container>
                <div v-for="answer in activeFeedback.answers" :key="answer.id">
                  <v-list-item three-line>
                    <v-list-item-content>
                      <v-list-item-subtitle class="font-weight-bold	">{{
                        answer.category.description
                      }}</v-list-item-subtitle>
                      <v-list-item-subtitle>
                        Rating: {{ answer.rating }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle>
                        Explanation: {{ answer.explanation }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider></v-divider>
                </div>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small @click="viewFeedback(item)">
        mdi-eye
      </v-icon>
    </template>
    <template v-slot:no-data>
      No Feedback
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
    headers: [
      {
        text: 'Submitted By',
        align: 'start',
        sortable: false,
        value: 'submittedBy'
      },
      {
        text: 'E-mail',
        sortable: false,
        value: 'submittedByEmail'
      },
      {
        text: 'Performance Review',
        sortable: false,
        value: 'reviewName'
      },
      {
        text: 'Submitted At',
        sortable: false,
        value: 'submittedAt'
      },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    options: {},
    loading: true,
    feedbacks: [],
    totalFeedbacks: 0,
    activeFeedback: null
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
    async getDataFromApi() {
      this.loading = true
      const { page, itemsPerPage: limit } = this.options
      const offset = (page - 1) * limit

      const data = await this.$axios.$get(
        `/api/users/${this.userId}/feedbacks`,
        {
          params: { limit, offset }
        }
      )

      this.feedbacks = data.feedbacks.map((d) => {
        const { submittedByUser, performanceReview } = d

        const submittedAt = this.$dateFns.format(
          new Date(d.createdAt),
          'LLLL d, yyyy HH:mm:ss'
        )
        return {
          ...d,
          submittedBy: submittedByUser
            ? `${submittedByUser.firstName} ${submittedByUser.lastName}`
            : '',
          submittedByEmail: submittedByUser ? submittedByUser.email : '',
          reviewName: performanceReview ? performanceReview.name : '',
          submittedAt
        }
      })
      this.totalFeedbacks = data.total

      this.loading = false
      return data
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.activeFeedback = false
      })
    },

    viewFeedback(item) {
      this.activeFeedback = item
      this.dialog = true
    }
  }
}
</script>
