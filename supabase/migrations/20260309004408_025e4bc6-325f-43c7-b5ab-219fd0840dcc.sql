-- Add selected_formula column to patient_energy_profiles
ALTER TABLE public.patient_energy_profiles 
ADD COLUMN selected_formula TEXT DEFAULT NULL;