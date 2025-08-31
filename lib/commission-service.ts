import type { CommissionCalculation, CommissionConfig } from './types';

export class CommissionService {
  // Configuration des commissions par défaut
  private static defaultCommissionConfigs: CommissionConfig[] = [
    {
      id: 'spvie',
      compagnie: 'SPVIE',
      taux_annee1: 0.30,
      taux_recurrent: 0.15,
      active: true,
      date_creation: new Date().toISOString()
    },
    {
      id: 'april',
      compagnie: 'APRIL',
      taux_annee1: 0.28,
      taux_recurrent: 0.14,
      active: true,
      date_creation: new Date().toISOString()
    },
    {
      id: 'neoliane',
      compagnie: 'NÉOLIANE',
      taux_annee1: 0.32,
      taux_recurrent: 0.16,
      active: true,
      date_creation: new Date().toISOString()
    }
  ];

  // Taux de commission par commercial
  private static commercialCommissionRates: Record<string, number> = {
    'SNOUSSI ZOUH': 0.306,
    'Radhia MAATOUG': 0.274,
    'Qualite premunia': 0.263,
    'KHRIBI Mariem': 0.279,
    'HADIR SFAR': 0.332,
    'Gestion PREM': 0.287,
    'DAHMANI Mouna': 0.269,
    'CHAOUABI CH': 0.300
  };

  /**
   * Obtenir le taux de commission pour un commercial
   */
  static getCommissionRateForCommercial(commercial: string): number {
    return this.commercialCommissionRates[commercial] || 0.03;
  }

  /**
   * Calculer la commission pour un contrat
   */
  static calculateCommissionForContract(
    compagnie: string,
    cotisationMensuelle: number,
    commercial?: string
  ): CommissionCalculation | null {
    try {
      // Validation des entrées
      if (!compagnie || cotisationMensuelle <= 0) {
        return null;
      }

      // Obtenir la configuration de commission
      const config = this.getCommissionConfig(compagnie);
      if (!config) {
        return null;
      }

      // Calculer les taux effectifs
      const tauxAnnee1 = commercial ? 
        this.getCommissionRateForCommercial(commercial) : 
        config.taux_annee1;
      
      const tauxRecurrent = config.taux_recurrent;

      // Calculs de commission (formule: cotisation * taux * 0.875)
      const commissionMensuelleAnnee1 = cotisationMensuelle * tauxAnnee1 * 0.875;
      const commissionMensuelleRecurrente = cotisationMensuelle * tauxRecurrent * 0.875;
      
      const commissionAnnuelleAnnee1 = commissionMensuelleAnnee1 * 12;
      const commissionAnnuelleRecurrente = commissionMensuelleRecurrente * 12;

      return {
        id: `calc_${Date.now()}`,
        projet_id: 0, // À définir selon le contexte
        compagnie,
        cotisation_mensuelle: cotisationMensuelle,
        commission_annee1: commissionAnnuelleAnnee1,
        commission_recurrente: commissionAnnuelleRecurrente,
        taux_commission: tauxAnnee1,
        date_creation: new Date().toISOString(),
        commercial,
        statut: 'success'
      };
    } catch (error) {
      console.error('Erreur calcul commission:', error);
      return null;
    }
  }

  /**
   * Obtenir la configuration de commission pour une compagnie
   */
  static getCommissionConfig(compagnie: string): CommissionConfig | null {
    return this.defaultCommissionConfigs.find(
      config => config.compagnie.toLowerCase() === compagnie.toLowerCase() && config.active
    ) || null;
  }

  /**
   * Obtenir toutes les configurations de commission
   */
  static getAllCommissionConfigs(): CommissionConfig[] {
    return this.defaultCommissionConfigs.filter(config => config.active);
  }

  /**
   * Valider une cotisation
   */
  static validateCotisation(cotisation: number): boolean {
    return cotisation > 0 && cotisation <= 10000;
  }

  /**
   * Formater un montant en euros
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calculer les statistiques globales de commission
   */
  static calculateGlobalStats(calculations: CommissionCalculation[]): {
    total_annee1: number;
    total_recurrent: number;
    moyenne_par_contrat: number;
    nombre_contrats: number;
  } {
    const totalAnnee1 = calculations.reduce((sum, calc) => sum + calc.commission_annee1, 0);
    const totalRecurrent = calculations.reduce((sum, calc) => sum + calc.commission_recurrente, 0);
    const nombreContrats = calculations.length;
    const moyenneParContrat = nombreContrats > 0 ? totalAnnee1 / nombreContrats : 0;

    return {
      total_annee1: totalAnnee1,
      total_recurrent: totalRecurrent,
      moyenne_par_contrat: moyenneParContrat,
      nombre_contrats: nombreContrats
    };
  }
}