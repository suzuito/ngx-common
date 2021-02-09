![npm (tag)](https://img.shields.io/npm/v/ngx-mugen-scroll/latest)

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

### Component

This library provides [NgxMugenScrollComponent](https://suzuito.github.io/ngx-mugen-scroll/components/NgxMugenScrollComponent.html) that implements infinite scroll.

`NgxMugenScrollComponent` has [provider](https://suzuito.github.io/ngx-mugen-scroll/components/NgxMugenScrollComponent.html#provider) that provides datas displayed on the component during scrolling.

`provider` is suitable for [DataProvider](https://suzuito.github.io/ngx-mugen-scroll/interfaces/DataProvider.html) interface.

Scroll position is saved automatically in memory. Saved position can be loaded when stream is redisplayed.

```html
<lib-ngx-mugen-scroll [provider]='provider'>
	  <div libMugenScrollTop></div>
	  <div *libMugenScrollData='let data = data'>
		    <div>{{data.index}}</div>
		    <div>{{data.message}}</div>
	  </div>
	  <div libMugenScrollBottom></div>
</lib-ngx-mugen-scroll>
```

`NgxMugenScrollComponent` must have three children.

- Top component
  - The component with `libMugenScrollTop` attribute represents top of the `NgxMugenScrollComponent`.
- Bottom component
  - The component with `libMugenScrollBottom` attribute represents bottom of the `NgxMugenScrollComponent`.
- Data component
  - The component with `libMugenScrollData` attribute represents row of the stream in `NgxMugenScrollComponent`.
  - Local variable `data` is provided by provider specified in `lib-ngx-mugen-scroll` tag.

If `autoFetchingBottom`(`autoFetchingTop`) is set to `true` and `top component` is visible, then next data is provided by `provider` and appended to the bottom(top) of stream.

### Provider

The class implementing `Provider` interface provides data on the stream.

TBD

### Scroll position store feature

TBD

## API

- [reference docs](https://suzuito.github.io/ngx-mugen-scroll)

## Example

### Simple infinite scroll

In left stream, data is fetched automatically when stream is located to bottom(top).

In Right stream, data is not fetched automatically when stream is located to bottom(top).
When use click `Read more ...` button, the data is fetched.

[live demo1](https://stackblitz.com/edit/angular-ivy-fuk6jc)