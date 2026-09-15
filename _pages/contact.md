---
permalink: /contact/
title: "Contact"
---

<div class="dual-contact-page">
  <div class="dual-contact-page__intro">
    <p class="dual-kicker"><span class="dual-crosshair" aria-hidden="true"></span> CONTACT / 05</p>
    <h1>Get in touch.</h1>
    <p>If you would like to discuss research, collaboration, reviewing, teaching, or related opportunities, feel free to reach out.</p>
  </div>

  <div class="dual-contact-page__grid">
    <section class="dual-contact-page__card">
      <h2>Contact</h2>
      <p><strong>Email</strong><br><a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a></p>
      <p><strong>Location</strong><br>{{ site.author.location }}</p>
      <p><strong>Affiliation</strong><br>{{ site.author.employer }}</p>
    </section>

    <section class="dual-contact-page__card">
      <h2>Profiles</h2>
      <p><a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></p>
      <p><a href="https://www.linkedin.com/in/{{ site.author.linkedin }}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></p>
      <p><a href="{{ site.author.googlescholar }}" target="_blank" rel="noopener noreferrer">Google Scholar ↗</a></p>
      <p><a href="{{ site.author.orcid }}" target="_blank" rel="noopener noreferrer">ORCID ↗</a></p>
    </section>
  </div>

  <section class="dual-contact-page__services">
    <h2>Academic services</h2>
    <p>Conference Reviewer: SoICT.<br>Journal Reviewer: TMLCN, IEEE Network Magazine.</p>
  </section>

  <section class="dual-contact-page__visitors" aria-label="Global visitor map">
    <div class="dual-contact-page__map-heading">
      <div>
        <p class="dual-kicker"><span class="dual-status__dot" aria-hidden="true"></span> GLOBAL VISITORS</p>
        <h2>Visitors around the world</h2>
      </div>
      <p>Approximate locations of recent website visitors.</p>
    </div>
    <div class="dual-contact-page__map">
      <script type="text/javascript" id="mapmyvisitors" src="//mapmyvisitors.com/map.js?d=sFLyYGujlXqBU2U7R0UGbc9LDJKeWkCcH47oQ_0Ux4c&cl=ffffff&w=a"></script>
      <noscript><a href="https://mapmyvisitors.com/" target="_blank" rel="noopener noreferrer">Visitor map</a></noscript>
    </div>
  </section>
</div>
