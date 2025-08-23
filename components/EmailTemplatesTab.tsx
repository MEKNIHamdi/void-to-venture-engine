import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../src/integrations/supabase/client'
import { 
  Plus, Edit2, Trash2, Eye, Mail, Filter, Search, 
  ChevronLeft, ChevronRight, Target, Loader2
} from 'lucide-react'
import type { EmailTemplate, Segment } from '../lib/types'

// Make TemplateVariables compatible with Supabase Json type
interface TemplateVariables {
  [key: string]: string | number | boolean | null
  nom_client: string
  prenom: string
  nom: string
  nom_commercial: string
  lien_rdv: string
  infos_premunia: string
}

interface EmailTemplatesTabProps {
  templates: EmailTemplate[]
  segments: Segment[]
  onTemplateUpdate: () => void
}

export function EmailTemplatesTab({ templates, segments, onTemplateUpdate }: EmailTemplatesTabProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    sujet: '',
    contenu_html: '',
    contenu_texte: '',
    categorie: 'marketing',
    statut: 'active'
  })

  // Sample variables for preview
  const sampleVariables: TemplateVariables = {
    nom_client: 'Jean Dupont',
    prenom: 'Jean',
    nom: 'Dupont',
    nom_commercial: 'Marie Martin',
    lien_rdv: 'https://premunia.com/rdv/123456',
    infos_premunia: `
      📞 Contactez-nous :
      Téléphone : 01 23 45 67 89
      Email : info@premunia.com
      Disponible du lundi au vendredi, 9h-18h
    `
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      sujet: '',
      contenu_html: '',
      contenu_texte: '',
      categorie: 'marketing',
      statut: 'active'
    })
  }

  const handleCreate = async () => {
    if (!formData.nom || !formData.sujet || !formData.contenu_html) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          ...formData,
          variables: sampleVariables as any,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Template créé avec succès"
      })
      
      setIsCreateDialogOpen(false)
      resetForm()
      onTemplateUpdate()
    } catch (error: any) {
      console.error('Error creating template:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedTemplate || !formData.nom || !formData.sujet || !formData.contenu_html) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...formData,
          variables: sampleVariables as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Template modifié avec succès"
      })
      
      setIsEditDialogOpen(false)
      setSelectedTemplate(null)
      resetForm()
      onTemplateUpdate()
    } catch (error: any) {
      console.error('Error updating template:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.nom}" ?`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', template.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Template supprimé avec succès"
      })
      
      onTemplateUpdate()
    } catch (error: any) {
      console.error('Error deleting template:', error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      nom: template.nom,
      sujet: template.sujet,
      contenu_html: template.contenu_html,
      contenu_texte: template.contenu_texte || '',
      categorie: template.categorie || 'marketing',
      statut: template.statut || 'active'
    })
    setIsEditDialogOpen(true)
  }

  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const personalizeContent = (content: string) => {
    return content
      .replace(/{{nom_client}}/g, sampleVariables.nom_client)
      .replace(/{{prenom}}/g, sampleVariables.prenom)
      .replace(/{{nom}}/g, sampleVariables.nom)
      .replace(/{{nom_commercial}}/g, sampleVariables.nom_commercial)
      .replace(/{{lien_rdv}}/g, sampleVariables.lien_rdv)
      .replace(/{{infos_premunia}}/g, sampleVariables.infos_premunia)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.categorie?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || template.categorie === categoryFilter
    const matchesStatus = statusFilter === "all" || template.statut === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'active':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case 'draft':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case 'archived':
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const getCategoryColor = (categorie: string) => {
    switch (categorie) {
      case 'marketing':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case 'transactionnel':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case 'relance':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates Email</h1>
          <p className="text-muted-foreground mt-2">
            {filteredTemplates.length} templates disponibles
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="transactionnel">Transactionnel</SelectItem>
                <SelectItem value="relance">Relance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
                setStatusFilter("all")
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{template.nom}</h3>
                    <Badge className={getCategoryColor(template.categorie || 'marketing')}>
                      {template.categorie || 'Marketing'}
                    </Badge>
                    <Badge className={getStatusColor(template.statut || 'active')}>
                      {template.statut || 'Actif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Sujet:</strong> {template.sujet}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Créé le {new Date(template.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openPreviewDialog(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(template)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {paginatedTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun template trouvé
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTemplates.length)} sur {filteredTemplates.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedTemplate(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Nouveau Template' : 'Modifier Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du template *</Label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Ex: Bienvenue nouveau client"
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select 
                  value={formData.categorie} 
                  onValueChange={(value) => setFormData({...formData, categorie: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transactionnel">Transactionnel</SelectItem>
                    <SelectItem value="relance">Relance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sujet de l'email *</Label>
              <Input
                value={formData.sujet}
                onChange={(e) => setFormData({...formData, sujet: e.target.value})}
                placeholder="Ex: Bienvenue chez Premunia, {{prenom}} !"
              />
            </div>

            <div className="space-y-2">
              <Label>Contenu HTML *</Label>
              <Textarea
                value={formData.contenu_html}
                onChange={(e) => setFormData({...formData, contenu_html: e.target.value})}
                placeholder="Contenu de l'email en HTML..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Contenu texte (optionnel)</Label>
              <Textarea
                value={formData.contenu_texte}
                onChange={(e) => setFormData({...formData, contenu_texte: e.target.value})}
                placeholder="Version texte de l'email..."
                rows={5}
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Variables disponibles :
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{nom_client}}'}</code> - Nom complet</div>
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{prenom}}'}</code> - Prénom</div>
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{nom}}'}</code> - Nom de famille</div>
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{nom_commercial}}'}</code> - Commercial assigné</div>
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{lien_rdv}}'}</code> - Lien RDV</div>
                <div><code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">{'{{infos_premunia}}'}</code> - Infos contact</div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                setSelectedTemplate(null)
                resetForm()
              }}>
                Annuler
              </Button>
              <Button 
                onClick={isCreateDialogOpen ? handleCreate : handleEdit}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isCreateDialogOpen ? 'Créer' : 'Modifier'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu - {selectedTemplate?.nom}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Sujet:</div>
                <div className="font-medium">
                  {personalizeContent(selectedTemplate.sujet)}
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Contenu HTML (rendu):</div>
                <div 
                  className="bg-white p-4 rounded border max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: personalizeContent(selectedTemplate.contenu_html) 
                  }}
                />
              </div>
              {selectedTemplate.contenu_texte && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Version texte:</div>
                  <pre className="whitespace-pre-wrap text-sm">
                    {personalizeContent(selectedTemplate.contenu_texte)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
