import { Component, ViewChild, ElementRef } from "@angular/core";
import { EventData } from 'data/observable';
import { Page } from 'ui/page';
import { Label } from "ui/label";
import { View } from "ui/core/view";

import * as utils from "utils/utils";
import { GestureEventData, PinchGestureEventData, PanGestureEventData } from "ui/gestures";


@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
})
export class ItemsComponent {
    @ViewChild("item") angularItem: ElementRef;
    item: View;

    @ViewChild("status") status: ElementRef;
    statusLbl: Label;

    states = ["unknown", "start", "change", "end"];
    density: number;
    prevDeltaX: number;
    prevDeltaY: number;
    startScale = 1;

    constructor() { }

    ngOnInit() {
        this.item = this.angularItem.nativeElement;
        this.statusLbl = this.status.nativeElement;

        this.density = utils.layout.getDisplayDensity();

        this.item.translateX = 0;
        this.item.translateY = 0;
        this.item.scaleX = 1;
        this.item.scaleY = 1;

        this.updateStatus();
    }

    onPan(args: PanGestureEventData) {
        console.log("PAN[" + this.states[args.state] + "] deltaX: " + Math.round(args.deltaX) + " deltaY: " + Math.round(args.deltaY));

        if (args.state === 1) {
            this.prevDeltaX = 0;
            this.prevDeltaY = 0;
        } else if (args.state === 2) {
            this.item.translateX += args.deltaX - this.prevDeltaX;
            this.item.translateY += args.deltaY - this.prevDeltaY;

            this.prevDeltaX = args.deltaX;
            this.prevDeltaY = args.deltaY;
        }

        this.updateStatus();
    }

    onPinch(args: PinchGestureEventData) {
        console.log("PINCH[" + this.states[args.state] + "] scale: " + args.scale + " focusX: " + args.getFocusX() + " focusY: " + args.getFocusY());

        if (args.state === 1) {
            const newOriginX = args.getFocusX() - this.item.translateX;
            const newOriginY = args.getFocusY() - this.item.translateY;

            const oldOriginX = this.item.originX * this.item.getMeasuredWidth();
            const oldOriginY = this.item.originY * this.item.getMeasuredHeight();

            this.item.translateX += (oldOriginX - newOriginX) * (1 - this.item.scaleX);
            this.item.translateY += (oldOriginY - newOriginY) * (1 - this.item.scaleY);

            this.item.originX = newOriginX / this.item.getMeasuredWidth();
            this.item.originY = newOriginY / this.item.getMeasuredHeight();

            this.startScale = this.item.scaleX;
        } else if (args.scale && args.scale !== 1) {
            let newScale = this.startScale * args.scale;
            newScale = Math.min(8, newScale);
            newScale = Math.max(0.125, newScale);

            this.item.scaleX = newScale;
            this.item.scaleY = newScale;
        }
    }

    onDoubleTap(args: GestureEventData) {
        console.log("DOUBLETAP");

        this.item.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeOut",
            duration: 300
        }).then(() => {
            this.updateStatus();
        });

        this.updateStatus();
    }

    updateStatus() {
        const text = "translate: [" + Math.round(this.item.translateX) + ", " + Math.round(this.item.translateY) + "]" +
            "\nscale: [" + (Math.round(this.item.scaleX * 100) / 100) + ", " + (Math.round(this.item.scaleY * 100) / 100) + "]" +
            "\norigin: [" + Math.round(this.item.originX * this.item.getMeasuredWidth()) + ", " + Math.round(this.item.originY * this.item.getMeasuredHeight()) + "]";

        this.statusLbl.text = text;
    }
}