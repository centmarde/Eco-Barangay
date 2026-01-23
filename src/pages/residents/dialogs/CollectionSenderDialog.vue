<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCollectionsStore } from "@/stores/collectionsData";
import { useAuthUserStore } from "@/stores/authUser";
import { PUROK_OPTIONS } from "@/utils/constants";
import type { CreateCollectionData } from "@/stores/collectionsData";
import {
  getGarbageTypes,
  validateCollectionRequest,
  getGarbageTypeIcon,
} from "@/utils/collectionHelpers";

// Props & Emits
const props = defineProps<{
  modelValue: boolean;
  initialData?: {
    purok?: string;
    notes?: string;
  };
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "collection-created": [collection: any];
}>();

// Stores
const collectionsStore = useCollectionsStore();
const authStore = useAuthUserStore();

// Refs
const formRef = ref();
const isFormValid = ref(false);
const loading = ref(false);

// Form Data
const formData = ref({
  purok: "",
  address: "",
  garbage_type: "",
  notes: "",
  is_hazardous: false,
});

// Garbage Types Options - Use helper function for electronic waste types
const garbageTypes = getGarbageTypes();

// Garbage Types with Icons for v-select
const garbageTypesWithIcons = computed(() => {
  return garbageTypes.map((type) => ({
    text: type,
    value: type,
    icon: getGarbageTypeIcon(type),
  }));
});

// Validation Rules
const rules = {
  required: (value: string) => !!value || "This field is required",
};

// Computed
const internalDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Methods
const closeDialog = () => {
  resetForm();
  internalDialog.value = false;
};

const resetForm = () => {
  formData.value = {
    purok: "",
    address: "",
    garbage_type: "",
    notes: "",
    is_hazardous: false,
  };
  formRef.value?.reset();
};

const submitRequest = async () => {
  // Use helper function for validation
  const validation = validateCollectionRequest(
    formData.value.purok,
    formData.value.address,
    formData.value.garbage_type,
  );
  if (!validation.valid) {
    return;
  }

  loading.value = true;

  try {
    // Get current user using getCurrentUser function
    const userResult = await authStore.getCurrentUser();

    if (userResult.error || !userResult.user) {
      console.error("User not authenticated");
      return;
    }

    const collectionData: CreateCollectionData = {
      address: formData.value.address,
      purok: formData.value.purok,
      request_by: userResult.user.id,
      collector_assign: null, // Explicitly set to null for new requests
      status: "pending",
      garbage_type: formData.value.garbage_type,
      notes: formData.value.notes || undefined, // Only include if notes are provided
      is_hazardous: formData.value.is_hazardous,
    };

    const result = await collectionsStore.createCollection(collectionData);

    if (result) {
      emit("collection-created", result);
      closeDialog();
    }
  } catch (error) {
    console.error("Error submitting collection request:", error);
  } finally {
    loading.value = false;
  }
};

// Watch for dialog close to reset form
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      resetForm();
    } else if (props.initialData) {
      // Pre-fill form if initialData is provided
      formData.value.purok = props.initialData.purok || "";
      // Only purok is pre-filled as requested
    }
  },
);
</script>

<template>
  <v-dialog v-model="internalDialog" max-width="600px" persistent scrollable>
    <v-card>
      <v-card-title class="text-h5 pa-4 bg-primary">
        <span class="text-white">Request Collection</span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid">
          <v-row>
            <!-- Purok Field -->
            <v-col cols="12">
              <v-select
                v-model="formData.purok"
                label="Purok"
                :items="PUROK_OPTIONS"
                placeholder="Select Purok"
                :rules="[rules.required]"
                required
                outlined
                dense
              ></v-select>
            </v-col>

            <!-- Address Field -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.address"
                label="Pickup Address"
                placeholder="Enter the complete address for garbage collection"
                rows="3"
                :rules="[rules.required]"
                required
                outlined
                dense
              ></v-textarea>
            </v-col>

            <!-- Garbage Type Field -->
            <v-col cols="12">
              <v-select
                v-model="formData.garbage_type"
                label="Garbage Type"
                :items="garbageTypesWithIcons"
                item-title="text"
                item-value="value"
                :rules="[rules.required]"
                required
                outlined
                dense
              >
                <template v-slot:selection="{ item }">
                  <v-icon
                    :icon="item.raw.icon"
                    size="small"
                    class="mr-2"
                  ></v-icon>
                  {{ item.raw.text }}
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :prepend-icon="item.raw.icon">
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Hazardous Checkbox -->
            <v-col cols="12" class="py-0">
              <v-checkbox
                v-model="formData.is_hazardous"
                label="Is this item hazardous? (e.g., leaking batteries, broken screens)"
                color="error"
                hide-details
                density="compact"
              ></v-checkbox>
            </v-col>

            <!-- Additional Notes (Optional) -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                label="Additional Notes (Optional)"
                placeholder="Any special instructions or details"
                rows="2"
                outlined
                dense
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="submitRequest"
          :loading="loading"
          :disabled="!isFormValid || loading"
        >
          Submit Request
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.v-card-title {
  font-weight: 600;
}

.v-card-text {
  max-height: 500px;
}

// Ensure proper spacing
.v-row {
  margin-top: 0;
}
</style>
