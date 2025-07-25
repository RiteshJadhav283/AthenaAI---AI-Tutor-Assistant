remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed text-foreground" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-primary mb-4 mt-6 pb-2 border-b border-primary/30" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-primary mb-3 mt-5 pb-1 border-b border-primary/20" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-primary mb-2 mt-4" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-md font-semibold text-foreground mb-2 mt-3" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-sm font-semibold text-foreground mb-2 mt-3" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-sm font-medium text-muted-foreground mb-2 mt-3" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const isInline = inline;
            const language = className?.replace('language-', '') || '';
            
            return isInline ? (
              <code 
                className="px-2 py-1 bg-muted/80 text-primary rounded text-sm font-mono border border-muted" 
                {...props}
              >
                {children}
              </code>
            ) : (
              <code 
                className="block p-4 bg-muted/60 rounded-lg text-sm font-mono overflow-x-auto border border-muted text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, children, ...props }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted/40 border border-muted" {...props}>
              {children}
            </pre>
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4 text-foreground" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 ml-4 text-foreground" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-2" {...props} />
          ),
          a: ({ node, href, ...props }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary-glow underline decoration-primary/50 hover:decoration-primary transition-colors" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary bg-primary/5 pl-4 py-2 italic mb-4 rounded-r-lg text-foreground" 
              {...props} 
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-card-border shadow-lg">
              <table className="w-full border-collapse bg-card/50 min-w-full" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-primary/15 border-b-2 border-primary/30" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-card-border/60" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-muted/30 transition-colors duration-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 text-left text-sm font-bold text-primary uppercase tracking-wider border-r border-primary/20 last:border-r-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm text-foreground whitespace-normal break-words border-r border-card-border/30 last:border-r-0" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-primary/30" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-primary" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),
          del: ({ node, ...props }) => (
            <del className="line-through text-muted-foreground opacity-75" {...props} />
          ),
          kbd: ({ node, ...props }) => (
            <kbd className="px-2 py-1 bg-muted border border-muted-foreground rounded text-xs font-mono" {...props} />
          ),
          mark: ({ node, ...props }) => (
            <mark className="bg-yellow-200/30 text-foreground px-1 rounded" {...props} />
          ),
          input: ({ node, type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  className="mr-2 text-primary focus:ring-primary rounded accent-primary"
                  disabled
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
          img: ({ node, src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-card-border"
              {...props}
            />
          ),
          details: ({ node, ...props }) => (
            <details className="mb-4 bg-card/30 rounded-lg border border-card-border" {...props} />
          ),
          summary: ({ node, ...props }) => (
            <summary className="p-4 font-medium text-foreground cursor-pointer hover:bg-muted/20 rounded-t-lg" {...props} />
          ),
        }}