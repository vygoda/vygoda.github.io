---
title: Фотоальбомы
menu: Фото
body_classes: header-image fullwidth

taxonomy:
    category: blog

content:
    items: @self.children
    order:
        by: date
        dir: desc
    pagination: false
---
