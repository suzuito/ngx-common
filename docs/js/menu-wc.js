'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ngx-mugen-scroll documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/NgxMugenScrollModule.html" data-type="entity-link">NgxMugenScrollModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' : 'data-target="#xs-components-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' :
                                            'id="xs-components-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' }>
                                            <li class="link">
                                                <a href="components/NgxMugenScrollComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">NgxMugenScrollComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' : 'data-target="#xs-directives-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' :
                                        'id="xs-directives-links-module-NgxMugenScrollModule-10d89f473e61171bae09ccdbfa3511b9"' }>
                                        <li class="link">
                                            <a href="directives/MugenScrollBottomDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">MugenScrollBottomDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/MugenScrollDataDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">MugenScrollDataDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/MugenScrollTopDirective.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules">MugenScrollTopDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/Cursor.html" data-type="entity-link">Cursor</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotFoundResourceError.html" data-type="entity-link">NotFoundResourceError</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/CursorStoreService.html" data-type="entity-link">CursorStoreService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderedDataStoreIdxService.html" data-type="entity-link">OrderedDataStoreIdxService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Ctx.html" data-type="entity-link">Ctx</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CursorStoreInfo.html" data-type="entity-link">CursorStoreInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataProvider.html" data-type="entity-link">DataProvider</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderedDataStoreIdxServiceIndex.html" data-type="entity-link">OrderedDataStoreIdxServiceIndex</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderedDataStoreIdxServiceStore.html" data-type="entity-link">OrderedDataStoreIdxServiceStore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScrollBottomEvent.html" data-type="entity-link">ScrollBottomEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScrollTopEvent.html" data-type="entity-link">ScrollTopEvent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});