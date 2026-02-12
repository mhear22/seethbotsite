import { ref, computed, watch, type Ref } from 'vue'

export interface FormStateOptions<T> {
  validateOnChange?: boolean
  resetOnSubmit?: boolean
}

export function useFormState<T extends Record<string, any>>(
  initialState: T,
  options: FormStateOptions<T> = {}
) {
  const formData: Ref<T> = ref({ ...initialState } as T)
  const errors: Ref<Partial<Record<keyof T, string>>> = ref({})
  const isDirty = ref(false)
  const isTouched: Ref<Partial<Record<keyof T, boolean>>> = ref({})

  // Track if form has been modified
  watch(
    formData,
    () => {
      isDirty.value = true
    },
    { deep: true }
  )

  /**
   * Reset form to initial state
   */
  const reset = () => {
    formData.value = { ...initialState } as T
    errors.value = {}
    isDirty.value = false
    isTouched.value = {}
  }

  /**
   * Reset form to a new initial state
   */
  const resetTo = (newState: T) => {
    formData.value = { ...newState } as T
    errors.value = {}
    isDirty.value = false
    isTouched.value = {}
  }

  /**
   * Set validation errors
   */
  const setErrors = (newErrors: Partial<Record<keyof T, string>>) => {
    errors.value = newErrors
  }

  /**
   * Set a single field error
   */
  const setFieldError = (field: keyof T, error: string | null) => {
    if (error === null) {
      delete errors.value[field]
    } else {
      errors.value[field] = error
    }
  }

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errors.value = {}
  }

  /**
   * Clear a single field error
   */
  const clearFieldError = (field: keyof T) => {
    delete errors.value[field]
  }

  /**
   * Mark a field as touched
   */
  const touchField = (field: keyof T) => {
    isTouched.value[field] = true
  }

  /**
   * Check if the form is valid (no errors)
   */
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  /**
   * Check if a specific field has an error
   */
  const hasError = (field: keyof T) => {
    return !!errors.value[field]
  }

  /**
   * Get error for a specific field
   */
  const getError = (field: keyof T) => {
    return errors.value[field] || null
  }

  /**
   * Check if a field has been touched
   */
  const isFieldTouched = (field: keyof T) => {
    return !!isTouched.value[field]
  }

  /**
   * Update a single field value
   */
  const setFieldValue = (field: keyof T, value: any) => {
    formData.value[field] = value
    touchField(field)
  }

  /**
   * Update multiple field values
   */
  const setValues = (values: Partial<T>) => {
    Object.assign(formData.value, values)
    Object.keys(values).forEach(key => touchField(key as keyof T))
  }

  /**
   * Validate form using a validation function
   */
  const validate = (
    validationFn: (data: T) => Partial<Record<keyof T, string>>
  ): boolean => {
    const validationErrors = validationFn(formData.value)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  /**
   * Submit handler wrapper that optionally resets on success
   */
  const handleSubmit = async (
    submitFn: (data: T) => Promise<void>
  ): Promise<boolean> => {
    try {
      await submitFn(formData.value)
      if (options.resetOnSubmit) {
        reset()
      }
      return true
    } catch (error) {
      return false
    }
  }

  return {
    formData,
    errors,
    isDirty,
    isTouched,
    isValid,
    reset,
    resetTo,
    setErrors,
    setFieldError,
    clearErrors,
    clearFieldError,
    touchField,
    hasError,
    getError,
    isFieldTouched,
    setFieldValue,
    setValues,
    validate,
    handleSubmit
  }
}
