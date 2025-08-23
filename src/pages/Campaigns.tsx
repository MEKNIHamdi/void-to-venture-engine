
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { CampaignsTab } from '../../components/CampaignsTab'
import { supabase } from '../integrations/supabase/client'

export default function CampaignsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      // Any initialization logic can go here
    }
  }, [user])

  if (loading) return null

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="Gestion des Campagnes">
      <CampaignsTab />
    </Layout>
  )
}
