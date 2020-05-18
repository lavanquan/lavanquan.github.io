---
layout: page
title: Categories
description: Some description.
permalink: /category
menu: true
---
{% assign date_format = site.date_format | default: "%m/%d/%Y" %}

<div class="tags">
  {% assign categories = site.category | sort %}
    {% for category in categories %}
        <a href="#{{ category | first | slugify }}">
    {% endfor %}
</div>

{% for category in site.category | sort %}
  <a class="post-anchor" id="{{ category[0] | slugify }}"></a>
  <div class="tag-title">
    <span>#{{ category[0] }}</span>
  </div>
  <ul class="post-list">
      {% assign pages_list = category[1] %}
      {% for post in pages_list reversed %}
          {% if post.title != null and post.is_generated != true %}
            {% if group == null or group == post.group %}
              <li><a href="{{ site.url }}{{ post.url }}">{{ post.title }}<span class="entry-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: date_format }}</time></a></li>
            {% endif %}
          {% endif %}
      {% endfor %}
      {% assign pages_list = nil %}
      {% assign group = nil %}
  </ul>
{% endfor %}