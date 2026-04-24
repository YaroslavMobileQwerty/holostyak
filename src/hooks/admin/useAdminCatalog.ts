import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'

export function useAdminSeasons() {
  return useQuery({
    queryKey: ['adminSeasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('number', { ascending: false })
      if (error) throw error
      return data as Tables<'seasons'>[]
    },
  })
}

export function useAdminBachelors(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['adminBachelors', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bachelors')
        .select('*')
        .eq('season_id', seasonId!)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data as Tables<'bachelors'>[]
    },
  })
}

export function useAdminEpisodesBySeason(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['adminEpisodesBySeason', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, number, title, status')
        .eq('season_id', seasonId!)
        .order('number', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useAdminParticipantsList(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['adminParticipants', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('season_id', seasonId!)
        .order('name', { ascending: true })
      if (error) throw error
      return data as Tables<'participants'>[]
    },
  })
}

export function useAdminSeasonMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['adminSeasons'] })
  }
  const create = useMutation({
    mutationFn: async (input: {
      p_number: number
      p_title: string
      p_status: string
      p_starts_at: string | null
      p_ends_at: string | null
    }) => {
      const { data, error } = await supabase.rpc('admin_create_season', input)
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: async (
      input: {
        p_id: string
        p_number: number
        p_title: string
        p_starts_at: string | null
        p_ends_at: string | null
      },
    ) => {
      const { error } = await supabase.rpc('admin_update_season', input)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
  const setStatus = useMutation({
    mutationFn: async (input: { p_id: string; p_status: string }) => {
      const { error } = await supabase.rpc('admin_set_season_status', input)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
  return { create, update, setStatus, invalidate }
}

export function useAdminBachelorMutations() {
  const qc = useQueryClient()
  const invalidate = (seasonId?: string) => {
    void qc.invalidateQueries({ queryKey: ['adminBachelors'] })
    if (seasonId) void qc.invalidateQueries({ queryKey: ['adminBachelors', seasonId] })
  }
  const create = useMutation({
    mutationFn: async (input: {
      p_season_id: string
      p_name: string
      p_photo_url: string | null
      p_bio: string | null
      p_order_index: number
    }) => {
      const { data, error } = await supabase.rpc('admin_create_bachelor', input)
      if (error) throw error
      return data
    },
    onSuccess: (_, v) => invalidate(v.p_season_id),
  })
  const update = useMutation({
    mutationFn: async (input: {
      p_id: string
      p_name: string
      p_photo_url: string | null
      p_bio: string | null
      p_order_index: number
    }) => {
      const { error } = await supabase.rpc('admin_update_bachelor', input)
      if (error) throw error
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['adminBachelors'] }),
  })
  return { create, update }
}

export function useAdminParticipantMutations() {
  const qc = useQueryClient()
  const create = useMutation({
    mutationFn: async (input: {
      p_season_id: string
      p_name: string
      p_current_bachelor_id: string | null
      p_age: number | null
      p_city: string | null
      p_photo_url: string | null
      p_bio: string | null
      p_status: string
      p_eliminated_episode_id: string | null
    }) => {
      const { data, error } = await supabase.rpc('admin_create_participant', input)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adminParticipants'] })
    },
  })
  const update = useMutation({
    mutationFn: async (input: {
      p_id: string
      p_name: string
      p_current_bachelor_id: string | null
      p_age: number | null
      p_city: string | null
      p_photo_url: string | null
      p_bio: string | null
      p_status: string
      p_eliminated_episode_id: string | null
    }) => {
      const { error } = await supabase.rpc('admin_update_participant', input)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adminParticipants'] })
    },
  })
  return { create, update }
}
