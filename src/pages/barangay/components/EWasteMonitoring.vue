<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useAuthUserStore } from "@/stores/authUser";
import { useToast } from "vue-toastification";
import type { PurokStatus, PurokMonitoring } from "@/stores/collectionsData";
import CollectionSenderDialog from "@/pages/residents/dialogs/CollectionSenderDialog.vue";

// Stores and Composables
const collectionsStore = useCollectionsStore();
const { purokMonitoring: puroks } = storeToRefs(collectionsStore);
const authStore = useAuthUserStore();
const toast = useToast();

const dialog = ref(false);
const selectedPurok = ref<PurokMonitoring | null>(null);
const loading = ref(false);
const surveyNotes = ref("");

// Collection Dialog State
const collectionDialog = ref(false);
const schedulingPurok = ref<PurokMonitoring | null>(null);
const prefilledData = ref({});

// Computed
const hasNeedsPickup = computed(() => {
  return puroks.value.some((p) => p.status === "needs_pickup");
});

// Methods
onMounted(async () => {
  await collectionsStore.fetchPurokMonitoring();
});

const openSurveyDialog = (purok: PurokMonitoring) => {
  selectedPurok.value = purok;
  surveyNotes.value = purok.notes || "";
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  selectedPurok.value = null;
};

const submitSurvey = async (hasWaste: boolean) => {
  if (!selectedPurok.value) return;

  const purokName = selectedPurok.value.name;
  loading.value = true;
  try {
    const status = hasWaste ? "needs_pickup" : "clean";
    const result = await collectionsStore.updatePurokStatus(
      selectedPurok.value.id,
      status,
      surveyNotes.value,
    );

    if (result) {
      closeDialog();
      toast.success(`Survey submitted for ${purokName}`);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to submit survey");
  } finally {
    loading.value = false;
  }
};

const schedulePickup = (purok: PurokMonitoring) => {
  if (!authStore.userData?.id) {
    toast.error("User not authenticated");
    return;
  }

  schedulingPurok.value = purok;
  prefilledData.value = {
    purok: purok.name,
    notes:
      "Scheduled from E-Waste Monitoring Survey" +
      (purok.notes ? `: ${purok.notes}` : ""),
  };
  collectionDialog.value = true;
};

const handleCollectionCreated = async (collection: any) => {
  if (!schedulingPurok.value || !collection) return;

  try {
    loading.value = true;
    await collectionsStore.linkPurokCollection(
      schedulingPurok.value.id,
      collection.id,
    );
    toast.success(`Pickup scheduled for ${schedulingPurok.value.name}`);
  } catch (error) {
    console.error("Error linking collection:", error);
    toast.error("Pickup created but failed to update monitoring status");
  } finally {
    loading.value = false;
    schedulingPurok.value = null;
  }
};

const getStatusColor = (status: PurokStatus) => {
  switch (status) {
    case "clean":
      return "success";
    case "needs_pickup":
      return "error";
    case "pickup_scheduled":
      return "info";
    default:
      return "medium-emphasis";
  }
};

const getStatusText = (status: PurokStatus) => {
  switch (status) {
    case "clean":
      return "Clean (No Waste)";
    case "needs_pickup":
      return "E-Waste Detected";
    case "pickup_scheduled":
      return "Pickup Scheduled";
    default:
      return "Not Surveyed";
  }
};
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center bg-primary text-white py-3 px-4">
      <v-icon class="mr-2">mdi-recycle</v-icon>
      Purok E-Waste Monitoring
      <v-spacer></v-spacer>
      <span class="text-caption">
        {{ new Date().toLocaleDateString() }}
      </span>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-table>
        <thead>
          <tr>
            <th class="text-left font-weight-bold">Purok Area</th>
            <th class="text-left font-weight-bold">Status</th>
            <th class="text-left font-weight-bold">Last Surveyed</th>
            <th class="text-center font-weight-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="purok in puroks" :key="purok.id">
            <td class="font-weight-medium">{{ purok.name }}</td>
            <td>
              <v-chip
                :color="getStatusColor(purok.status)"
                size="small"
                label
                class="font-weight-medium"
              >
                <v-icon start size="small" v-if="purok.status === 'clean'"
                  >mdi-check-circle</v-icon
                >
                <v-icon
                  start
                  size="small"
                  v-else-if="purok.status === 'needs_pickup'"
                  >mdi-alert-circle</v-icon
                >
                <v-icon
                  start
                  size="small"
                  v-else-if="purok.status === 'pickup_scheduled'"
                  >mdi-truck-fast</v-icon
                >
                <v-icon start size="small" v-else>mdi-help-circle</v-icon>
                {{ getStatusText(purok.status) }}
              </v-chip>
            </td>
            <td class="text-medium-emphasis">
              {{
                purok.last_surveyed
                  ? new Date(purok.last_surveyed).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }}
            </td>
            <td class="text-center">
              <v-btn
                v-if="purok.status === 'pending' || purok.status === 'clean'"
                color="primary"
                variant="tonal"
                size="small"
                @click="openSurveyDialog(purok)"
              >
                <v-icon start>mdi-clipboard-check</v-icon>
                Survey
              </v-btn>

              <v-btn
                v-else-if="purok.status === 'needs_pickup'"
                color="error"
                variant="flat"
                size="small"
                :loading="loading"
                @click="schedulePickup(purok)"
              >
                <v-icon start>mdi-truck-delivery</v-icon>
                Schedule Pickup
              </v-btn>

              <v-btn
                v-else-if="purok.status === 'pickup_scheduled'"
                color="info"
                variant="text"
                size="small"
                disabled
              >
                Waiting for Collection
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <!-- Survey Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card v-if="selectedPurok">
        <v-card-title class="bg-primary text-white">
          Survey: {{ selectedPurok.name }}
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-h6 mb-4 text-center">
            Is there E-Waste present in this Purok?
          </p>
          <v-textarea
            v-model="surveyNotes"
            label="Notes (Optional)"
            rows="2"
            variant="outlined"
            density="compact"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="justify-center pb-4 px-4">
          <v-btn
            color="success"
            variant="elevated"
            class="flex-grow-1 mr-2"
            prepend-icon="mdi-thumb-down"
            @click="submitSurvey(false)"
          >
            No Waste (Clean)
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            class="flex-grow-1 ml-2"
            prepend-icon="mdi-thumb-up"
            @click="submitSurvey(true)"
          >
            Yes, Needs Pickup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Collection Sender Dialog -->
    <CollectionSenderDialog
      v-model="collectionDialog"
      :initial-data="prefilledData"
      @collection-created="handleCollectionCreated"
    />
  </v-card>
</template>
