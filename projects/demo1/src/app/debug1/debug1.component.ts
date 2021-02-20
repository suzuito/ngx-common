import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SnackbarLoggerService } from '../snackbar-logger.service';

interface Data {
  index: number;
  text: string;
}

@Component({
  selector: 'app-debug1',
  templateUrl: './debug1.component.html',
  styleUrls: ['./debug1.component.scss']
})
export class Debug1Component implements OnInit, AfterViewInit {

  @ViewChild('top')
  private top: ElementRef | undefined;

  @ViewChild('bottom')
  private bottom: ElementRef | undefined;

  @ViewChild('stream')
  private stream: ElementRef | undefined;

  public data: Array<Data>;

  private intersectionObserver: IntersectionObserver | undefined;

  constructor(
    private logger: SnackbarLoggerService,
  ) {
    this.data = [];
    for (let i = 0; i < 20; i++) {
      this.data.push({
        index: i,
        text: `hello-${i}`,
      });
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.stream === undefined) {
      throw new Error('top is undefined');
    }
    if (this.bottom === undefined) {
      throw new Error('bottom is undefined');
    }
    if (this.top === undefined) {
      throw new Error('top is undefined');
    }
    // New current state
    this.intersectionObserver = new IntersectionObserver(
      (entities: Array<IntersectionObserverEntry>): void => {
        entities.forEach(entity => {
          this.logger.info(`${entity.target.id} - ${entity.isIntersecting}`);
        });
      },
      {
        root: this.stream.nativeElement,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );
    this.intersectionObserver.observe(this.bottom.nativeElement);
    this.intersectionObserver.observe(this.top.nativeElement);
  }

  debugScroll(ev: any): void {
    this.logger.info(ev.target.scrollTop);
  }

}
