---
permalink: /research/
title: "Research"
---

{% include base_path %}

{% assign ordered_pages = site.portfolio  | sort:"order_number" %}

{% for post in ordered_pages %}
  {% include archive-single.html type="grid" %}
{% endfor %}

