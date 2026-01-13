-- Adicionar policy INSERT para notifications para permitir que usuários criem suas próprias notificações
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);