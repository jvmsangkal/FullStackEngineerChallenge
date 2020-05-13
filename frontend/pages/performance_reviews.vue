<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-data-table
        :headers="headers"
        :items="performanceReviews"
        :options.sync="options"
        :server-items-length="totalPerformanceReviews"
        :loading="loading"
        loading-text="Loading... Please wait"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Performance Reviews</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on"
                  >New Performance Review</v-btn
                >
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-form v-model="valid" @submit.prevent="save">
                      <v-row>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field
                            v-model="editedItem.name"
                            label="Review name"
                            :rules="[(v) => !!v || 'Review name is required']"
                            required
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="12" md="12">
                          <v-btn dark small color="primary" @click="addCategory">Add Category</v-btn>
                        </v-col>
                      </v-row>
                      <v-row v-for="(category, index) in editedItem.categories" :key="index">
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field
                            v-model="editedItem.categories[index].description"
                            :label="'Category ' + ( index + 1 )"
                            :rules="[(v) => !!v || 'Category description is required']"
                            append-icon="mdi-close"
                            @click:append="deleteCategory(index)"
                            required
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
                  <v-btn
                    color="green darken-1"
                    text
                    @click="confirmDeleteDialog"
                    >Yes</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editPerformanceReview(item)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="deletePerformanceReview(item)">
            mdi-delete
          </v-icon>
        </template>
        <template v-slot:no-data>
          No Performance Reviews
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: 'isAdmin',
  data: () => ({
    dialog: false,
    valid: false,
    deleteDialog: false,
    deleteId: '',
    headers: [
      {
        text: 'Review Name',
        align: 'start',
        sortable: false,
        value: 'name'
      },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    options: {},
    loading: true,
    performanceReviews: [],
    totalPerformanceReviews: 0,
    editId: '',
    editedItem: {
      name: '',
      categories: [
        {
          description: ''
        }
      ]
    },
    defaultItem: {
      name: '',
      categories: [
        {
          description: ''
        }
      ]
    }
  }),

  computed: {
    formTitle() {
      return this.editId === -1
        ? 'New Performance Review'
        : 'Edit Performance Review'
    }
  },

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

      const data = await this.$axios.$get('/api/performance_reviews', {
        params: { limit, offset }
      })

      this.performanceReviews = data.performanceReviews
      this.totalPerformanceReviews = data.total

      this.loading = false
      return data
    },

    addCategory() {
      this.editedItem.categories.push({
        description: ''
      })
    },

    deleteCategory(index) {
      this.editedItem.categories.splice(index, 1)
    },

    deletePerformanceReview(item) {
      this.deleteDialog = true
      this.deleteId = item.id
    },

    closeDeleteDialog() {
      this.deleteDialog = false
      this.deleteId = ''
    },

    async confirmDeleteDialog() {
      try {
        await this.$axios.$delete('/api/performance_reviews/' + this.deleteId)
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

    editPerformanceReview(item) {
      this.editId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editId = ''
      })
    },

    async save() {
      if (!this.valid) {
        return
      }

      if (this.editId) {
        try {
          await this.$axios.$put('/api/performance_reviews/' + this.editId, {
            performanceReview: this.editedItem
          })
          this.$nuxt.$emit('snackbar', {
            color: 'success',
            message: 'Successfully updated!'
          })
        } catch (err) {
          this.$nuxt.$emit('snackbar', {
            color: 'error',
            message: 'Something went wrong!'
          })
        }
      } else {
        try {
          await this.$axios.$post('/api/performance_reviews/', {
            performanceReview: this.editedItem
          })
          this.$nuxt.$emit('snackbar', {
            color: 'success',
            message: 'Successfully updated!'
          })
        } catch (err) {
          this.$nuxt.$emit('snackbar', {
            color: 'error',
            message: 'Something went wrong!'
          })
        }
      }
      this.getDataFromApi()
      this.close()
    }
  }
}
</script>
