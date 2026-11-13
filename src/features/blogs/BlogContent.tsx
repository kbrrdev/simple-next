import Markdown from 'react-markdown';

/** Renders a post's Markdown. HTML in the text is dropped, so nothing is inserted as HTML. */
export function BlogContent({ content }: { content: string }) {
  return (
    <div className="max-w-prose space-y-5 text-[1.0625rem] leading-8 [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">
      <Markdown skipHtml>{content}</Markdown>
    </div>
  );
}
