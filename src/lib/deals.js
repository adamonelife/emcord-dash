import { supabase } from './supabaseClient';

// Mirrors the eventual GoHighLevel (GHL) opportunity shape — name, pipelineId,
// pipelineStageId, contactId, monetaryValue, assignedTo, source — so that
// swapping this file's internals for GHL API calls later doesn't require
// touching any component that consumes it.
//
// Field mapping for when GHL is wired in:
//   company        -> opportunity.contact.companyName / contactId lookup
//   contact_name    -> opportunity.contact.name
//   contact_email   -> opportunity.contact.email
//   stage           -> opportunity.pipelineStageId (resolve to a label via
//                       GHL's pipeline/stage config, since GHL stage IDs are
//                       per-pipeline rather than a fixed global list)
//   amount          -> opportunity.monetaryValue
//   owner           -> opportunity.assignedTo
//   source          -> opportunity.source
//   expected_close  -> no direct GHL equivalent; keep as a local-only field

export const STAGES = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

export const SERVICE_TYPES = [
  'Digital Twin',
  'AR',
  'MR',
  'VR',
  'Immersive Experience'
];

export async function getDeals() {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createDeal(deal) {
  const { data, error } = await supabase
    .from('deals')
    .insert([deal])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDeal(id, patch) {
  const { data, error } = await supabase
    .from('deals')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDeal(id) {
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) throw error;
}
