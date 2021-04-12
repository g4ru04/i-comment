const axios = require('axios');

const comments = [];
async function sleep(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getCommentRecursive(shortcode, cursor) {
  const variables = {
    shortcode,
    first: 50,
    after: cursor,
    child_comment_count: 10,
  };
  const response = await axios.get('https://www.instagram.com/graphql/query/',{
    headers: {
      origin: 'https://www.instagram.com/',
      cookie: 'ig_did=',
    },
    params: {
      query_hash: 'bc3296d1ce80a24b1b6e40b1e72903f5',
      variables: JSON.stringify(variables),
    },
  });
  const res = response.data;
  if (typeof res === 'string') {
    console.log('改一下 ig_did 吧');
    return;
  }

  if (!res.data || !res.status || res.status !== 'ok') {
    console.log('IG api response 異常');
    return;
  }
  console.log(`進度: ${comments.length}/${res.data.shortcode_media.edge_media_to_parent_comment.count}`);

  comments.push(...res.data.shortcode_media.edge_media_to_parent_comment.edges);
  if (res.data.shortcode_media.edge_media_to_parent_comment.edges.length > 0) {
    await sleep(2000);
    getCommentRecursive(
      shortcode,
      res.data.shortcode_media.edge_media_to_parent_comment.page_info.end_cursor,
    );
  } else {
    console.log(`含回覆共 ${res.data.shortcode_media.edge_media_to_parent_comment.count} 筆`);
    console.log(`直接留言 ${comments.length} 筆`);
    console.log(comments.map((comment, i) => (`${i}\t\t${comment.node.owner.username}\t\t${comment.node.text}`)).join('\n'));
  }
}

(async () => {
  try {
    const shortcode = 'CNHwe6VlMpX';
    await getCommentRecursive(shortcode);
  } catch (error) {
    console.log(error);
  }
})();
