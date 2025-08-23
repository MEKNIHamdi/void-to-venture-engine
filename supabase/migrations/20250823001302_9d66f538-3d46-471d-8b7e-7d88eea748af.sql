
-- Mettre à jour la configuration Premunia avec les bons paramètres Brevo
UPDATE public.email_configurations 
SET 
  smtp_host = 'smtp-relay.brevo.com',
  smtp_username = '694946002@smtp-brevo.com',
  description = 'Configuration Premunia - Serveur Brevo',
  updated_at = now()
WHERE email = 'info@premunia.com' AND id = 2;
