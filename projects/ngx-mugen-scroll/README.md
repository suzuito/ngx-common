The infinite scroll library for AngularJS

# NgxMugenScroll

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.9.

- [API references](https://suzuito.github.io/ngx-mugen-scroll/)
- [live demo1](https://stackblitz.com/edit/angular-ivy-fuk6jc)

# Set up

You need to import `NgxMugenScrollModule`.

```typescript
import { NgxMugenScrollModule } from 'ngx-mugen-scroll';
...
@NgModule({
  imports: [
      ...
    NgxMugenScrollModule,
      ...
  ],
```

# Usage

## Overview

This library provides [NgxMugenScrollComponent](https://suzuito.github.io/ngx-mugen-scroll/components/NgxMugenScrollComponent.html) that implements infinite scroll.

`NgxMugenScrollComponent` has [provider](https://suzuito.github.io/ngx-mugen-scroll/components/NgxMugenScrollComponent.html#provider) that provides datas displayed on the component during scrolling.

`provider` is suitable for [DataProvider](https://suzuito.github.io/ngx-mugen-scroll/interfaces/DataProvider.html) interface.

## API

- [reference docs](https://suzuito.github.io/ngx-mugen-scroll)

## Example

### Simple infinite scroll

[live demo1](https://stackblitz.com/edit/angular-ivy-fuk6jc)