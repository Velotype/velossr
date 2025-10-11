// deno-lint-ignore-file no-explicit-any

import type {ChildrenAttr, DynamicServerComponent, StaticServerFunctionComponent, ServerVNode, StaticServerComponent} from "../tsx/ssr-core.ts"

import type {AnchorHTMLAttributes, HTMLAttributes, AreaHTMLAttributes, ArticleHTMLAttributes, AsideHTMLAttributes, AudioHTMLAttributes, BaseHTMLAttributes, BlockquoteHTMLAttributes, BrHTMLAttributes, ButtonHTMLAttributes, CanvasHTMLAttributes, CaptionHTMLAttributes, ColHTMLAttributes, ColgroupHTMLAttributes, DataHTMLAttributes, DataListHTMLAttributes, DdHTMLAttributes, DelHTMLAttributes, DetailsHTMLAttributes, DialogHTMLAttributes, DlHTMLAttributes, DtHTMLAttributes, EmbedHTMLAttributes, FieldsetHTMLAttributes, FigcaptionHTMLAttributes, FooterHTMLAttributes, FormHTMLAttributes, HeadingHTMLAttributes, HeadHTMLAttributes, HeaderHTMLAttributes, HrHTMLAttributes, HtmlHTMLAttributes, IframeHTMLAttributes, ImgHTMLAttributes, InputHTMLAttributes, InsHTMLAttributes, LabelHTMLAttributes, LegendHTMLAttributes, LiHTMLAttributes, LinkHTMLAttributes, MainHTMLAttributes, MapHTMLAttributes, MenuHTMLAttributes, MetaHTMLAttributes, MeterHTMLAttributes, NavHTMLAttributes, NoScriptHTMLAttributes, ObjectHTMLAttributes, OlHTMLAttributes, OptgroupHTMLAttributes, OptionHTMLAttributes, OutputHTMLAttributes, PictureHTMLAttributes, ProgressHTMLAttributes, QuoteHTMLAttributes, ScriptHTMLAttributes, SearchHTMLAttributes, SelectHTMLAttributes, SlotHTMLAttributes, SourceHTMLAttributes, StyleHTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, TemplateHTMLAttributes, TextareaHTMLAttributes, ThHTMLAttributes, TimeHTMLAttributes, TitleHTMLAttributes, TrackHTMLAttributes, UlHTMLAttributes, VideoHTMLAttributes, WbrHTMLAttributes } from "./dom-types.d.ts"

/**
 * The JSX namespace includes a baseline of HTML types for validating HTML tags and their
 * accepted attributes
 */
export namespace JSXInternal {

    /** Types that are allowed as a `<tag/>` */
    export type ElementType<C extends StaticServerComponent<any> | DynamicServerComponent<any>> = keyof IntrinsicElements
        | StaticServerFunctionComponent<any>
        | C

    /**
     * JSX Return type (the type returned by `createElement()` )
     */
    export type Element = ServerVNode

    /**
     * IntrinsicElements defines the set of allowed
     * string tags and maps their Attributes' types
     * `<tag {attrs}/>`
     */
    export interface IntrinsicElements {
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a */
        a: AnchorHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr */
        abbr: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address */
        address: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area */
        area: AreaHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article */
        article: ArticleHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside */
        aside: AsideHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio */
        audio: AudioHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b */
        b: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base */
        base: BaseHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi */
        bdi: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdo */
        bdo: HTMLAttributes & ChildrenAttr
        // big is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote */
        blockquote: BlockquoteHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/body */
        body: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br */
        br: BrHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button */
        button: ButtonHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas */
        canvas: CanvasHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption */
        caption: CaptionHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite */
        cite: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code */
        code: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/col */
        col: ColHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/colgroup */
        colgroup: ColgroupHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data */
        data: DataHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist */
        datalist: DataListHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd */
        dd: DdHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/del */
        del: DelHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details */
        details: DetailsHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dfn */
        dfn: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog */
        dialog: DialogHTMLAttributes & ChildrenAttr
        // dir is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div */
        div: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl */
        dl: DlHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt */
        dt: DtHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em */
        em: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/embed */
        embed: EmbedHTMLAttributes // void element (no children allowed)
        // fencedframe has limited availability - TODO, implement: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fencedframe
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset */
        fieldset: FieldsetHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption */
        figcaption: FigcaptionHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure */
        figure: HTMLAttributes & ChildrenAttr
        // font is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer */
        footer: FooterHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form */
        form: FormHTMLAttributes & ChildrenAttr
        // frame is deprecated
        // frameset is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h1: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h2: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h3: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h4: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h5: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements */
        h6: HeadingHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head */
        head: HeadHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header */
        header: HeaderHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hgroup */
        hgroup: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr */
        hr: HrHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/html */
        html: HtmlHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i */
        i: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe */
        iframe: IframeHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img */
        img: ImgHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input */
        input: InputHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ins */
        ins: InsHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd */
        kbd: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label */
        label: LabelHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend */
        legend: LegendHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li */
        li: LiHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link */
        link: LinkHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main */
        main: MainHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/map */
        map: MapHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark */
        mark: HTMLAttributes & ChildrenAttr
        // marquee is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu */
        menu: MenuHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menuitem */
        menuitem: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta */
        meta: MetaHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter */
        meter: MeterHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav */
        nav: NavHTMLAttributes & ChildrenAttr
        // nobr is deprecated
        // noembed is deprecated
        // noiframe is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noscript */
        noscript: NoScriptHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object */
        object: ObjectHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol */
        ol: OlHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup */
        optgroup: OptgroupHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option */
        option: OptionHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output */
        output: OutputHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p */
        p: HTMLAttributes & ChildrenAttr
        // param is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture */
        picture: PictureHTMLAttributes & ChildrenAttr
        // plaintext is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre */
        pre: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress */
        progress: ProgressHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q */
        q: QuoteHTMLAttributes & ChildrenAttr
        // rp is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rp */
        rp: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rt */
        rt: HTMLAttributes & ChildrenAttr
        // rtc is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby */
        ruby: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/s */
        s: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/samp */
        samp: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script */
        script: ScriptHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search */
        search: SearchHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section */
        section: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select */
        select: SelectHTMLAttributes & ChildrenAttr
        // selectedcontent has limited availability - TODO, implement: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/selectedcontent
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot */
        slot: SlotHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small */
        small: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source */
        source: SourceHTMLAttributes // void element (no children allowed)
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span */
        span: HTMLAttributes & ChildrenAttr
        // strike is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong */
        strong: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/style */
        style: StyleHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sub */
        sub: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary */
        summary: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sup */
        sup: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table */
        table: TableHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody */
        tbody: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td */
        td: TdHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template */
        template: TemplateHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea */
        textarea: TextareaHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot */
        tfoot: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th */
        th: ThHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead */
        thead: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time */
        time: TimeHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/title */
        title: TitleHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr */
        tr: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track */
        track: TrackHTMLAttributes // void element (no children allowed)
        // tt is deprecated
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/u */
        u: UlHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul */
        ul: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/var */
        var: HTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video */
        video: VideoHTMLAttributes & ChildrenAttr
        /** Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/wbr */
        wbr: WbrHTMLAttributes // void element (no children allowed)
        // xmp is deprecated
    }
}
