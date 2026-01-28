import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Terms() {
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
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-semibold">Termos de Uso</h1>
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
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar o aplicativo Ethra ("Aplicativo"), você concorda em cumprir e 
              estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes 
              termos, não deverá utilizar o Aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Ethra é uma plataforma de autoconhecimento de estilo pessoal que utiliza tecnologias 
              de Inteligência Artificial para:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Realizar análise cromática baseada em características pessoais</li>
              <li>Sugerir combinações de roupas e looks</li>
              <li>Oferecer provador virtual com tecnologia de IA generativa</li>
              <li>Gerenciar guarda-roupa digital</li>
              <li>Planejar viagens com sugestões de looks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Natureza do Serviço e Limitações</h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4">
              <p className="text-foreground font-medium mb-2">⚠️ Importante</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O Ethra é uma ferramenta de entretenimento e autoconhecimento. As análises, sugestões 
                e recomendações geradas por Inteligência Artificial <strong>não substituem</strong> consultoria 
                profissional de imagem, dermatológica ou de moda.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Os resultados do provador virtual são simulações geradas por IA e podem não representar 
              com exatidão como uma peça de roupa ficará em seu corpo. Recomendamos sempre experimentar 
              as peças antes de adquiri-las.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Uso de Imagens e Dados Biométricos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para funcionalidades como análise cromática e provador virtual, o Aplicativo pode 
              solicitar acesso à câmera ou upload de fotos. Ao utilizar estas funcionalidades:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Você consente expressamente com o processamento de suas imagens por IA</li>
              <li>Fotos de análise cromática são processadas e descartadas imediatamente</li>
              <li>Avatares do provador virtual são armazenados de forma segura e criptografada</li>
              <li>Você pode solicitar a exclusão de todas as suas imagens a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Requisitos de Idade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O uso do Ethra é destinado a pessoas com 18 anos ou mais. Ao criar uma conta, você 
              declara ter a idade mínima necessária. Não coletamos intencionalmente dados de menores 
              de idade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo do Aplicativo, incluindo mas não limitado a textos, gráficos, logos, 
              ícones, imagens e software, é propriedade do Ethra ou de seus licenciadores e está 
              protegido por leis de direitos autorais.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O conteúdo gerado por você (fotos, looks salvos) permanece de sua propriedade, mas 
              você nos concede licença para processá-lo conforme necessário para fornecer o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Ethra não se responsabiliza por:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>Decisões de compra baseadas em sugestões do Aplicativo</li>
              <li>Diferenças entre simulações virtuais e produtos reais</li>
              <li>Resultados de análises cromáticas que não atendam expectativas</li>
              <li>Interrupções ou erros no funcionamento do serviço</li>
              <li>Perda de dados devido a falhas técnicas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Assinaturas e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Aplicativo oferece planos gratuitos e pagos. Ao assinar um plano pago:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>A cobrança será recorrente conforme o período escolhido</li>
              <li>Você pode cancelar a qualquer momento, sem reembolso proporcional</li>
              <li>Mudanças de preço serão comunicadas com 30 dias de antecedência</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações 
              significativas serão comunicadas por email ou notificação no Aplicativo. O uso 
              continuado após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Foro e Legislação Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer 
              disputa será resolvida no foro da comarca de São Paulo/SP, com exclusão de qualquer 
              outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato pelo email:{' '}
              <a href="mailto:contato@ethra.app" className="text-primary hover:underline">
                contato@ethra.app
              </a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
