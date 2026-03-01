<section id="contato" class="contact-section container-fluid" aria-labelledby="contact-title">
  <div class="row center-xs">
    <div class="col-xs-12 col-md-10">
      <div class="row center-xs">
        <div class="col-xs-12">
          <h2 class="section-title section-title-light contact-section-title">Contato</h2>
        </div>
      </div>
      <div class="contact-shell">
        <div class="row top-xs">
          <div class="col-xs-12 col-md-5">
            <div class="contact-intro">
              <p class="contact-kicker">Atendimento Personalizado</p>
              <h2 id="contact-title" class="contact-title">Fale com a equipe agora</h2>
              <p class="contact-text">
                Envie uma mensagem com seu caso e retornamos com orientação inicial.
                Atendimento humanizado, claro e objetivo.
              </p>
              <ul class="contact-highlights">
                <li>Retorno rápido em horário comercial</li>
                <li>Atendimento para pessoa física e empresas</li>
                <li>Sigilo e ética profissional</li>
              </ul>
            </div>
          </div>

          <div class="col-xs-12 col-md-7">
            <form id="contact-form" class="contact-form" novalidate>
              <div class="contact-grid">
                <label class="contact-field">
                  <span>Nome completo</span>
                  <input type="text" name="name" autocomplete="name" required />
                </label>

                <label class="contact-field">
                  <span>Celular / WhatsApp</span>
                  <input type="tel" name="phone" inputmode="tel" placeholder="(00) 00000-0000" required />
                </label>

                <label class="contact-field">
                  <span>E-mail</span>
                  <input type="email" name="email" autocomplete="email" required />
                </label>

                <label class="contact-field">
                  <span>Área de interesse</span>
                  <select name="area" required>
                    <option value="">Selecione</option>
                    <option value="Direito Criminal">Direito Criminal</option>
                    <option value="Direito Previdenciário">Direito Previdenciário</option>
                    <option value="Direito do Consumidor">Direito do Consumidor</option>
                    <option value="Direito Trabalhista">Direito Trabalhista</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>

                <label class="contact-field contact-field-full">
                  <span>Mensagem</span>
                  <textarea name="message" rows="5" required placeholder="Descreva seu caso de forma resumida."></textarea>
                </label>
              </div>

              <div class="contact-actions">
                <button type="submit" class="btn contact-submit-btn">Enviar</button>
                <p id="contact-feedback" class="contact-feedback" aria-live="polite"></p>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<section class="contact-map-shell contact-map-shell--full" aria-label="Mapa de Itajai, Santa Catarina">
  <iframe
    class="contact-map-frame"
    title="Mapa de Itajai, Santa Catarina"
    data-src="https://www.google.com/maps?q=Itajai,+SC&output=embed"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    allowfullscreen
  ></iframe>
  <noscript>
    <iframe
      class="contact-map-frame"
      title="Mapa de Itajai, Santa Catarina"
      src="https://www.google.com/maps?q=Itajai,+SC&output=embed"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
    ></iframe>
  </noscript>
</section>

<script src="scripts/contact/domain/contact.domain.js" defer></script>
<script src="scripts/contact/adapters/contact.repository.js" defer></script>
<script src="scripts/contact/application/submit-contact.usecase.js" defer></script>
<script src="scripts/contact/ui/contact.controller.js" defer></script>
<script src="scripts/contact/app.js" defer></script>
