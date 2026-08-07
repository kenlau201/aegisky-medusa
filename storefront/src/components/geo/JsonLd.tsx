/**
 * JSON-LD 组件 - 在页面中注入结构化数据
 */

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  const dataArray = Array.isArray(data) ? data : [data];

  return (
    <>
      {dataArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
