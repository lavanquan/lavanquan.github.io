---
layout: page
title: Categories
description: Some description.
permalink: /category/
menu: true
---


<div>
    {% assign categories = site.category | sort %}
    {% for category in categories %}
        <span class="site-tag">
            <a href="#{{ category | first | slugify }}">
                    {{ category[0] | replace:'-', ' ' }} ({{ category | last | size }})
            </a>
        </span>
    {% endfor %}
</div>