import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/welcome">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-semibold">Política de Privacidade</h1>
          </div>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-neutral dark:prose-invert max-w-none space-y-8"
        >
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade descreve como o Ethra ("nós", "nosso" ou "Aplicativo") 
              coleta, usa, armazena e protege suas informações pessoais, em conformidade com a 
              Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Controlador dos Dados e Encarregado (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Ethra é o controlador dos dados pessoais coletados através do Aplicativo,
              nos termos da LGPD (Lei nº 13.709/2018).
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">Encarregado de Proteção de Dados (DPO)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Conforme Art. 41 da LGPD, designamos o seguinte Encarregado pelo tratamento
              de dados pessoais:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li><strong>Nome:</strong> Equipe de Privacidade Ethra</li>
              <li><strong>Email:</strong>{' '}
                <a href="mailto:contato@ethra.com.br" className="text-primary hover:underline">
                  contato@ethra.com.br
                </a>
              </li>
              <li><strong>Canal de atendimento:</strong> Seção "Ajuda &gt; Privacidade" dentro do Aplicativo</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              O Encarregado é responsável por aceitar reclamações e comunicações dos titulares
              de dados, prestar esclarecimentos e adotar providências, bem como receber
              comunicações da Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos os seguintes tipos de dados:
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-4">3.1. Dados de Cadastro</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>Email</li>
              <li>Nome (opcional)</li>
              <li>Senha (armazenada de forma criptografada)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4">3.2. Dados de Perfil</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>Preferências de estilo</li>
              <li>Resultado da análise cromática (estação de cores)</li>
              <li>Configurações de acessibilidade</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4">3.3. Dados Biométricos (Dados Sensíveis)</h3>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4">
              <p className="text-foreground font-medium mb-2">⚠️ Tratamento Especial</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Conforme LGPD Art. 11, dados biométricos requerem consentimento específico e destacado.
              </p>
            </div>
            <ul className="text-muted-foreground space-y-1">
              <li>Fotos para análise cromática (processadas e descartadas)</li>
              <li>Avatares para provador virtual (armazenados com consentimento)</li>
              <li>Características físicas inferidas (tom de pele, cor de olhos/cabelo)</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4">3.4. Dados do Guarda-Roupa</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>Fotos de peças de roupa</li>
              <li>Categorias e descrições</li>
              <li>Looks salvos</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4">3.5. Dados de Uso</h3>
            <ul className="text-muted-foreground space-y-1">
              <li>Interações com o Aplicativo</li>
              <li>Recursos utilizados</li>
              <li>Horários de acesso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Finalidade do Tratamento</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-foreground">Dado</th>
                  <th className="text-left py-2 text-foreground">Finalidade</th>
                  <th className="text-left py-2 text-foreground">Base Legal</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">Email/Senha</td>
                  <td className="py-2">Autenticação e segurança</td>
                  <td className="py-2">Execução de contrato</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Fotos para análise</td>
                  <td className="py-2">Determinar paleta de cores</td>
                  <td className="py-2">Consentimento</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Avatares</td>
                  <td className="py-2">Provador virtual</td>
                  <td className="py-2">Consentimento</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Guarda-roupa</td>
                  <td className="py-2">Sugestões de looks</td>
                  <td className="py-2">Execução de contrato</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Dados de uso</td>
                  <td className="py-2">Melhoria do serviço</td>
                  <td className="py-2">Legítimo interesse</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li><strong>Processadores de IA:</strong> Google (Gemini) e Fal.ai para análises e geração de imagens. Dados são processados conforme políticas de privacidade destes serviços.</li>
              <li><strong>Infraestrutura:</strong> Provedores de hospedagem e armazenamento em nuvem.</li>
              <li><strong>Processadores de pagamento:</strong> Para assinaturas pagas (não armazenamos dados de cartão).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Não vendemos</strong> seus dados pessoais a terceiros para fins de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Retenção de Dados</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-foreground">Tipo de Dado</th>
                  <th className="text-left py-2 text-foreground">Período de Retenção</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2">Fotos para análise cromática</td>
                  <td className="py-2">Processamento imediato, sem armazenamento</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Avatares (provador virtual)</td>
                  <td className="py-2">12 meses após o último uso</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Resultados de prova virtual</td>
                  <td className="py-2">7 dias (URLs externas) / 12 meses (armazenados)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Guarda-roupa (peças e looks)</td>
                  <td className="py-2">Vigência da conta + 30 dias</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Dados de perfil</td>
                  <td className="py-2">Vigência da conta + 30 dias</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Logs de consentimento biométrico</td>
                  <td className="py-2">5 anos (obrigação legal — LGPD Art. 16)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Dados após exclusão de conta</td>
                  <td className="py-2">Excluídos em até 30 dias</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Seus Direitos (LGPD Art. 18)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você tem direito a:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou exclusão:</strong> Solicitar exclusão de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> Solicitar exclusão completa de seus dados</li>
              <li><strong>Revogação de consentimento:</strong> Retirar consentimento a qualquer momento</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer qualquer destes direitos, acesse as Configurações do Aplicativo ou entre 
              em contato pelo email <a href="mailto:privacidade@ethra.app" className="text-primary hover:underline">privacidade@ethra.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia em repouso para dados sensíveis</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento de segurança contínuo</li>
              <li>Backups regulares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Cookies e Tecnologias Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos armazenamento local (localStorage) para:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>Manter sua sessão ativa</li>
              <li>Salvar preferências de tema e acessibilidade</li>
              <li>Melhorar a performance do Aplicativo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política periodicamente. Alterações significativas serão 
              comunicadas por email ou notificação no Aplicativo. Recomendamos revisar esta página 
              regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre esta Política ou para exercer seus direitos previstos
              na LGPD, entre em contato com nosso Encarregado de Dados (DPO):
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>Email:{' '}
                <a href="mailto:contato@ethra.com.br" className="text-primary hover:underline">
                  contato@ethra.com.br
                </a>
              </li>
              <li>Canal no App: Ajuda &gt; Privacidade</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
